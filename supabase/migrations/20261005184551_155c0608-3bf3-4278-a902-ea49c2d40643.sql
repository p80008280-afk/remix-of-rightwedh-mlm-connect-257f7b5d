CREATE OR REPLACE FUNCTION public.admin_topup_member(_member_code text, _product_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_user uuid; v_prod uuid; v_order uuid; v_code text := upper(trim(_member_code));
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  SELECT id INTO v_user FROM public.profiles WHERE upper(member_code)=v_code OR upper(referral_code)=v_code LIMIT 1;
  IF v_user IS NULL THEN RAISE EXCEPTION 'Member ID % not found', v_code; END IF;
  IF EXISTS (SELECT 1 FROM public.orders WHERE user_id=v_user AND payment_method='admin_topup') THEN
    RAISE EXCEPTION 'This ID is already topped up';
  END IF;
  v_prod := _product_id;
  IF v_prod IS NULL THEN
    SELECT id INTO v_prod FROM public.products WHERE status='active' ORDER BY (mrp=3250) DESC, mrp DESC, created_at LIMIT 1;
  END IF;
  IF v_prod IS NULL THEN RAISE EXCEPTION 'No active product found for top-up'; END IF;
  INSERT INTO public.orders(user_id,product_id,amount,status,payment_method,admin_note,upi_reference,quantity)
  VALUES (v_user,v_prod,0,'approved','admin_topup','Admin top-up (no payment)','ADMIN-TOPUP',1) RETURNING id INTO v_order;
  PERFORM public.process_order_approval(v_order);
  UPDATE public.profiles SET is_active=true WHERE id=v_user;
  RETURN jsonb_build_object('ok',true,'orderId',v_order);
END; $$;
REVOKE ALL ON FUNCTION public.admin_topup_member(text,uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_topup_member(text,uuid) TO authenticated;