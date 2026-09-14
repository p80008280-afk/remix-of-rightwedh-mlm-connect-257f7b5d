ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS login_password text NOT NULL DEFAULT '';

ALTER TABLE public.user_rewards
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'claimed',
  ADD COLUMN IF NOT EXISTS claim_deadline timestamp with time zone,
  ADD COLUMN IF NOT EXISTS claimed_at timestamp with time zone;

UPDATE public.user_rewards SET status = 'claimed', claimed_at = COALESCE(claimed_at, created_at) WHERE status IS NULL OR status = 'claimed';

ALTER TABLE public.user_rewards ALTER COLUMN status SET DEFAULT 'available';

CREATE OR REPLACE FUNCTION public.credit_rewards(_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_pairs INT; r RECORD;
BEGIN
  SELECT matched_pairs INTO v_pairs FROM public.tree_stats WHERE user_id = _user_id;
  IF v_pairs IS NULL THEN RETURN; END IF;
  FOR r IN SELECT * FROM public.reward_levels WHERE pairs_required <= v_pairs ORDER BY level LOOP
    IF NOT EXISTS (SELECT 1 FROM public.user_rewards WHERE user_id = _user_id AND level = r.level) THEN
      INSERT INTO public.user_rewards (user_id, level, amount, status, claim_deadline)
      VALUES (_user_id, r.level, r.amount, 'available', now() + interval '7 days');
    END IF;
  END LOOP;
END; $function$;

CREATE OR REPLACE FUNCTION public.expire_due_rewards(_user_id uuid)
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  UPDATE public.user_rewards
  SET status = 'expired'
  WHERE user_id = _user_id AND status = 'available' AND claim_deadline < now();
$function$;

CREATE OR REPLACE FUNCTION public.claim_reward(_user_id uuid, _level integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE v_reward public.user_rewards%ROWTYPE;
BEGIN
  PERFORM public.expire_due_rewards(_user_id);

  SELECT * INTO v_reward FROM public.user_rewards
  WHERE user_id = _user_id AND level = _level FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Reward not available'; END IF;
  IF v_reward.status = 'claimed' THEN RAISE EXCEPTION 'Reward already claimed'; END IF;
  IF v_reward.status <> 'available' THEN RAISE EXCEPTION 'Reward has expired'; END IF;

  UPDATE public.user_rewards
  SET status = 'claimed', claimed_at = now()
  WHERE id = v_reward.id;

  INSERT INTO public.commissions (user_id, type, amount, note)
  VALUES (_user_id, 'reward', v_reward.amount, 'Level ' || _level || ' reward claimed');

  UPDATE public.wallets
  SET balance = balance + v_reward.amount,
      total_earned = total_earned + v_reward.amount,
      updated_at = now()
  WHERE user_id = _user_id;
END; $function$;