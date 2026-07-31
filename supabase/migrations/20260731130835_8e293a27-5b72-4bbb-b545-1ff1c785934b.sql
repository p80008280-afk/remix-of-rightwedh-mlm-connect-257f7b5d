CREATE OR REPLACE FUNCTION public.admin_review_order(
  _order_id uuid,
  _action text,
  _note text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%ROWTYPE;
BEGIN
  IF _action NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'Invalid review action';
  END IF;

  SELECT * INTO v_order
  FROM public.orders
  WHERE id = _order_id
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF v_order.status <> 'pending' THEN RAISE EXCEPTION 'Order has already been reviewed'; END IF;

  IF _action = 'reject' THEN
    UPDATE public.orders
    SET status = 'rejected', admin_note = COALESCE(_note, ''), processed_at = now()
    WHERE id = _order_id;
    RETURN;
  END IF;

  UPDATE public.orders
  SET status = 'approved', admin_note = COALESCE(_note, '')
  WHERE id = _order_id;

  PERFORM public.process_order_approval(_order_id);

  IF NOT EXISTS (
    SELECT 1 FROM public.orders WHERE id = _order_id AND processed_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Order commission processing did not complete';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_review_withdrawal(
  _withdrawal_id uuid,
  _action text,
  _note text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_withdrawal public.withdrawals%ROWTYPE;
BEGIN
  IF _action NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'Invalid review action';
  END IF;

  SELECT * INTO v_withdrawal
  FROM public.withdrawals
  WHERE id = _withdrawal_id
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'Withdrawal not found'; END IF;
  IF v_withdrawal.status <> 'pending' THEN RAISE EXCEPTION 'Withdrawal has already been reviewed'; END IF;

  IF _action = 'reject' THEN
    UPDATE public.withdrawals
    SET status = 'rejected', admin_note = COALESCE(_note, ''), processed_at = now()
    WHERE id = _withdrawal_id;
    RETURN;
  END IF;

  UPDATE public.withdrawals
  SET status = 'approved', admin_note = COALESCE(_note, '')
  WHERE id = _withdrawal_id;

  PERFORM public.process_withdrawal_approval(_withdrawal_id);

  IF NOT EXISTS (
    SELECT 1 FROM public.withdrawals WHERE id = _withdrawal_id AND processed_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Withdrawal processing did not complete';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_review_order(uuid, text, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_review_withdrawal(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_order(uuid, text, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_review_withdrawal(uuid, text, text) TO service_role;

DROP FUNCTION IF EXISTS public.get_my_direct_team();