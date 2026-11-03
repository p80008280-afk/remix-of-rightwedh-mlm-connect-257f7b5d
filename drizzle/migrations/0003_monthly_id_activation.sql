ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_until timestamptz;

UPDATE public.profiles p SET active_until = coalesce(
  (SELECT max(coalesce(o.processed_at, o.created_at)) FROM public.orders o WHERE o.user_id = p.id AND o.status = 'approved'),
  p.created_at) + interval '30 days'
WHERE p.is_active AND NOT public.has_role(p.id, 'admin');

CREATE OR REPLACE FUNCTION public.member_is_earning(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin') OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = _user_id AND is_active
      AND coalesce(account_status, 'active') = 'active'
      AND active_until IS NOT NULL AND active_until > now())
$$;

CREATE OR REPLACE FUNCTION public.expire_lapsed_members()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
  UPDATE public.profiles p SET is_active = false
  WHERE p.is_active AND p.active_until IS NOT NULL AND p.active_until <= now()
    AND NOT public.has_role(p.id, 'admin');
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END; $$;
GRANT EXECUTE ON FUNCTION public.expire_lapsed_members() TO authenticated;

SELECT public.expire_lapsed_members();

CREATE OR REPLACE FUNCTION public.protect_activation_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_user = 'authenticated' AND NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.is_active := OLD.is_active;
    NEW.active_until := OLD.active_until;
    NEW.account_status := OLD.account_status;
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS protect_activation_fields ON public.profiles;
CREATE TRIGGER protect_activation_fields BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_activation_fields();

CREATE OR REPLACE FUNCTION public.process_order_approval(_order_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE
  v_order RECORD; v_product RECORD; v_buyer RECORD;
  v_sponsor_id UUID; v_current UUID; v_parent UUID; v_side TEXT;
  v_stats RECORD; v_new_pairs INT; v_allowed_pairs INT; v_pair_amount NUMERIC; v_cap INT;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = _order_id FOR UPDATE;
  IF NOT FOUND OR v_order.status <> 'approved' OR v_order.processed_at IS NOT NULL THEN RETURN; END IF;

  PERFORM public.expire_lapsed_members();

  SELECT * INTO v_product FROM public.products WHERE id = v_order.product_id;
  SELECT * INTO v_buyer FROM public.profiles WHERE id = v_order.user_id;
  SELECT daily_pair_cap INTO v_cap FROM public.plan_settings WHERE id = 1;
  IF v_cap IS NULL THEN v_cap := 20; END IF;

  UPDATE public.profiles
  SET is_active = true,
      active_until = GREATEST(coalesce(active_until, now()), now()) + interval '30 days'
  WHERE id = v_buyer.id;

  v_sponsor_id := v_buyer.sponsor_id;
  IF v_sponsor_id IS NOT NULL AND v_product.direct_commission > 0 AND public.member_is_earning(v_sponsor_id) THEN
    INSERT INTO public.commissions (user_id, from_user_id, order_id, type, amount, note)
    VALUES (v_sponsor_id, v_buyer.id, _order_id, 'direct', v_product.direct_commission, 'Direct sale of ' || v_product.name);
    UPDATE public.wallets
    SET balance = balance + v_product.direct_commission,
        total_earned = total_earned + v_product.direct_commission,
        direct_income = direct_income + v_product.direct_commission,
        updated_at = now()
    WHERE user_id = v_sponsor_id;
  END IF;

  v_current := v_buyer.id;
  LOOP
    SELECT parent_id, position INTO v_parent, v_side FROM public.profiles WHERE id = v_current;
    EXIT WHEN v_parent IS NULL OR v_side IS NULL;
    IF v_side = 'left' THEN
      UPDATE public.tree_stats SET left_count = left_count + 1, updated_at = now() WHERE user_id = v_parent;
    ELSE
      UPDATE public.tree_stats SET right_count = right_count + 1, updated_at = now() WHERE user_id = v_parent;
    END IF;
    UPDATE public.tree_stats SET pairs_today = 0, pairs_day = CURRENT_DATE WHERE user_id = v_parent AND pairs_day <> CURRENT_DATE;
    SELECT * INTO v_stats FROM public.tree_stats WHERE user_id = v_parent;
    v_new_pairs := LEAST(v_stats.left_count, v_stats.right_count) - v_stats.matched_pairs;
    v_allowed_pairs := GREATEST(0, LEAST(v_new_pairs, v_cap - v_stats.pairs_today));
    IF v_allowed_pairs > 0 AND v_product.pair_bonus > 0 AND public.member_is_earning(v_parent) THEN
      v_pair_amount := v_allowed_pairs * v_product.pair_bonus;
      UPDATE public.tree_stats SET matched_pairs = matched_pairs + v_allowed_pairs, pairs_today = pairs_today + v_allowed_pairs WHERE user_id = v_parent;
      INSERT INTO public.commissions (user_id, from_user_id, order_id, type, amount, note)
      VALUES (v_parent, v_buyer.id, _order_id, 'pair', v_pair_amount, v_allowed_pairs || ' pair(s) matched (daily cap ' || v_cap || ')');
      UPDATE public.wallets SET balance = balance + v_pair_amount, total_earned = total_earned + v_pair_amount, pair_income = pair_income + v_pair_amount, updated_at = now() WHERE user_id = v_parent;
      PERFORM public.credit_rewards(v_parent);
    END IF;
    v_current := v_parent;
  END LOOP;
  UPDATE public.orders SET processed_at = now() WHERE id = _order_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_topup_member(_member_code text, _product_id uuid DEFAULT NULL::uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE v_user uuid; v_prod uuid; v_order uuid; v_code text := upper(trim(_member_code));
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  SELECT id INTO v_user FROM public.profiles WHERE upper(member_code)=v_code OR upper(referral_code)=v_code LIMIT 1;
  IF v_user IS NULL THEN RAISE EXCEPTION 'Member ID % not found', v_code; END IF;
  PERFORM public.expire_lapsed_members();
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id=v_user AND is_active AND active_until > now()) THEN
    RAISE EXCEPTION 'This ID is already active until %', (SELECT to_char(active_until AT TIME ZONE 'Asia/Kolkata','DD Mon YYYY') FROM public.profiles WHERE id=v_user);
  END IF;
  v_prod := _product_id;
  IF v_prod IS NULL THEN
    SELECT id INTO v_prod FROM public.products WHERE status='active' ORDER BY (mrp=3250) DESC, mrp DESC, created_at LIMIT 1;
  END IF;
  IF v_prod IS NULL THEN RAISE EXCEPTION 'No active product found for top-up'; END IF;
  INSERT INTO public.orders(user_id,product_id,amount,status,payment_method,admin_note,upi_reference,quantity)
  VALUES (v_user,v_prod,0,'approved','admin_topup','Admin top-up (no payment)','ADMIN-TOPUP',1) RETURNING id INTO v_order;
  PERFORM public.process_order_approval(v_order);
  RETURN jsonb_build_object('ok',true,'orderId',v_order);
END; $function$;

CREATE OR REPLACE FUNCTION public.admin_set_member_state(_user_id uuid, _account_status text DEFAULT NULL::text, _is_active boolean DEFAULT NULL::boolean, _kyc_status text DEFAULT NULL::text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$ BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF _account_status IS NOT NULL AND _account_status NOT IN ('active','inactive','suspended','banned') THEN RAISE EXCEPTION 'Invalid account status'; END IF;
  IF _kyc_status IS NOT NULL AND _kyc_status NOT IN ('pending','approved','rejected') THEN RAISE EXCEPTION 'Invalid KYC status'; END IF;
  UPDATE public.profiles SET account_status = coalesce(_account_status, account_status),
    is_active = coalesce(_is_active, is_active),
    active_until = CASE
      WHEN _is_active IS TRUE AND (active_until IS NULL OR active_until <= now()) THEN now() + interval '30 days'
      WHEN _is_active IS FALSE THEN now()
      ELSE active_until END,
    kyc_status = coalesce(_kyc_status, kyc_status) WHERE id = _user_id;
END; $function$;

CREATE OR REPLACE FUNCTION public.admin_set_member_state(_actor_id uuid, _user_id uuid, _account_status text DEFAULT NULL::text, _is_active boolean DEFAULT NULL::boolean, _kyc_status text DEFAULT NULL::text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$ BEGIN
  IF NOT public.has_role(_actor_id,'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF _account_status IS NOT NULL AND _account_status NOT IN ('active','inactive','suspended','banned') THEN RAISE EXCEPTION 'Invalid account status'; END IF;
  IF _kyc_status IS NOT NULL AND _kyc_status NOT IN ('pending','approved','rejected') THEN RAISE EXCEPTION 'Invalid KYC status'; END IF;
  UPDATE public.profiles SET account_status=coalesce(_account_status,account_status),
    is_active=coalesce(_is_active,is_active),
    active_until = CASE
      WHEN _is_active IS TRUE AND (active_until IS NULL OR active_until <= now()) THEN now() + interval '30 days'
      WHEN _is_active IS FALSE THEN now()
      ELSE active_until END,
    kyc_status=coalesce(_kyc_status,kyc_status) WHERE id=_user_id;
END; $function$;

CREATE OR REPLACE FUNCTION public.set_active_until_on_activate()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.is_active AND NOT coalesce(OLD.is_active, false) AND (NEW.active_until IS NULL OR NEW.active_until <= now()) THEN
    NEW.active_until := now() + interval '30 days';
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS zz_set_active_until_on_activate ON public.profiles;
CREATE TRIGGER zz_set_active_until_on_activate BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_active_until_on_activate();