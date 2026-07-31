UPDATE public.products
SET image_url = '/aaurva-capsule.png'
WHERE image_url LIKE '/__l5e/assets-v1/%';

UPDATE public.plan_settings
SET qr_image_url = '/phonepe-qr.png',
    qr_image_path = 'default/phonepe-qr.png',
    updated_at = now()
WHERE id = 1 AND qr_image_url LIKE '/__l5e/assets-v1/%';

CREATE OR REPLACE FUNCTION public.process_order_approval(_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_product RECORD;
  v_buyer RECORD;
  v_sponsor_id UUID;
  v_current UUID;
  v_parent UUID;
  v_side TEXT;
  v_stats RECORD;
  v_new_pairs INT;
  v_allowed_pairs INT;
  v_pair_amount NUMERIC;
  v_cap INT;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = _order_id FOR UPDATE;
  IF NOT FOUND OR v_order.status <> 'approved' OR v_order.processed_at IS NOT NULL THEN RETURN; END IF;

  SELECT * INTO v_product FROM public.products WHERE id = v_order.product_id;
  SELECT * INTO v_buyer FROM public.profiles WHERE id = v_order.user_id;
  SELECT daily_pair_cap INTO v_cap FROM public.plan_settings WHERE id = 1;
  IF v_cap IS NULL THEN v_cap := 20; END IF;

  UPDATE public.profiles SET is_active = true WHERE id = v_buyer.id;
  v_sponsor_id := v_buyer.sponsor_id;
  IF v_sponsor_id IS NOT NULL AND v_product.direct_commission > 0 THEN
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
    IF v_allowed_pairs > 0 AND v_product.pair_bonus > 0 THEN
      v_pair_amount := v_allowed_pairs * v_product.pair_bonus;
      UPDATE public.tree_stats SET matched_pairs = matched_pairs + v_allowed_pairs, pairs_today = pairs_today + v_allowed_pairs WHERE user_id = v_parent;
      INSERT INTO public.commissions (user_id, from_user_id, order_id, type, amount, note)
      VALUES (v_parent, v_buyer.id, _order_id, 'pair', v_pair_amount, v_allowed_pairs || ' pair(s) matched (daily cap ' || v_cap || ')');
      UPDATE public.wallets SET balance = balance + v_pair_amount, total_earned = total_earned + v_pair_amount, pair_income = pair_income + v_pair_amount, updated_at = now() WHERE user_id = v_parent;
    END IF;
    v_current := v_parent;
  END LOOP;
  UPDATE public.orders SET processed_at = now() WHERE id = _order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.process_withdrawal_approval(_withdrawal_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_w RECORD;
  v_bal NUMERIC;
BEGIN
  SELECT * INTO v_w FROM public.withdrawals WHERE id = _withdrawal_id FOR UPDATE;
  IF NOT FOUND OR v_w.status <> 'approved' OR v_w.processed_at IS NOT NULL THEN RETURN; END IF;
  SELECT balance INTO v_bal FROM public.wallets WHERE user_id = v_w.user_id FOR UPDATE;
  IF v_bal < v_w.amount THEN RAISE EXCEPTION 'Insufficient balance'; END IF;
  UPDATE public.wallets SET balance = balance - v_w.amount, updated_at = now() WHERE user_id = v_w.user_id;
  UPDATE public.withdrawals SET processed_at = now() WHERE id = _withdrawal_id;
END;
$$;

REVOKE ALL ON FUNCTION public.process_order_approval(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.process_withdrawal_approval(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_order_approval(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.process_withdrawal_approval(uuid) TO service_role;