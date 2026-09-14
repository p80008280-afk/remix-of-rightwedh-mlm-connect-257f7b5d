CREATE OR REPLACE FUNCTION public.register_member(
  _full_name text, _mobile text, _real_email text, _dob date, _password text,
  _sponsor_code text DEFAULT '', _position text DEFAULT 'left', _activate boolean DEFAULT false,
  _admin_authorized boolean DEFAULT false
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  v_user_id uuid := gen_random_uuid(); v_email text; v_member_code text; v_referral_code text; v_encrypted_password text;
BEGIN
  IF _full_name IS NULL OR length(trim(_full_name)) < 2 THEN RAISE EXCEPTION 'Enter a valid full name'; END IF;
  IF _mobile !~ '^[6-9][0-9]{9}$' THEN RAISE EXCEPTION 'Enter a valid 10-digit mobile number'; END IF;
  IF _real_email IS NULL OR position('@' in _real_email) < 2 THEN RAISE EXCEPTION 'Enter a valid email'; END IF;
  IF length(_password) < 6 OR length(_password) > 72 THEN RAISE EXCEPTION 'Password must be 6 to 72 characters'; END IF;
  IF _position NOT IN ('left','right') THEN RAISE EXCEPTION 'Invalid position'; END IF;
  IF _activate AND NOT _admin_authorized THEN RAISE EXCEPTION 'Only an admin can activate a new ID'; END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = _mobile OR phone = _mobile) THEN RAISE EXCEPTION 'This mobile number is already registered'; END IF;
  v_email := _mobile || '@rs.local'; v_member_code := public.generate_member_code(); v_referral_code := public.generate_referral_code(); v_encrypted_password := crypt(_password, gen_salt('bf'));
  INSERT INTO auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,raw_app_meta_data,raw_user_meta_data,created_at,updated_at,confirmation_token,recovery_token,email_change_token_new,email_change)
  VALUES ('00000000-0000-0000-0000-000000000000',v_user_id,'authenticated','authenticated',v_email,v_encrypted_password,now(),'{"provider":"email","providers":["email"]}'::jsonb,jsonb_build_object('full_name',trim(_full_name),'phone',_mobile,'username',_mobile,'real_email',trim(_real_email),'sponsor_code',upper(trim(coalesce(_sponsor_code,''))),'position',_position),now(),now(),'','','','');
  UPDATE public.profiles SET full_name=trim(_full_name),phone=_mobile,email=trim(_real_email),username=_mobile,dob=_dob,member_code=v_member_code,referral_code=v_referral_code,is_active=CASE WHEN _admin_authorized THEN _activate ELSE false END,account_status='active',login_password=_password WHERE id=v_user_id;
  RETURN jsonb_build_object('ok',true,'memberCode',v_member_code,'referralCode',v_referral_code);
END; $$;

CREATE OR REPLACE FUNCTION public.get_member_direct_team(_user_id uuid)
RETURNS TABLE(id uuid, full_name text, referral_code text, member_position text, created_at timestamptz, is_active boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT p.id,p.full_name,p.referral_code,p.position,p.created_at,p.is_active FROM public.profiles p WHERE p.sponsor_id=_user_id ORDER BY p.created_at DESC;
$$;
CREATE OR REPLACE FUNCTION public.get_member_tree_rows(_user_id uuid)
RETURNS TABLE(id uuid, full_name text, member_code text, parent_id uuid, member_position text, is_active boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
 WITH RECURSIVE downline AS (
  SELECT p.id,p.full_name,p.member_code,p.parent_id,p.position,p.is_active,0 depth FROM public.profiles p WHERE p.id=_user_id
  UNION ALL SELECT c.id,c.full_name,c.member_code,c.parent_id,c.position,c.is_active,d.depth+1 FROM public.profiles c JOIN downline d ON c.parent_id=d.id WHERE d.depth<10
 ) SELECT d.id,d.full_name,d.member_code,d.parent_id,d.position,d.is_active FROM downline d;
$$;
CREATE OR REPLACE FUNCTION public.admin_review_order_hosted(_actor_id uuid,_order_id uuid,_action text,_note text DEFAULT '') RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF NOT public.has_role(_actor_id,'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF; PERFORM public.admin_review_order(_order_id,_action,_note); END; $$;
CREATE OR REPLACE FUNCTION public.admin_review_withdrawal_hosted(_actor_id uuid,_withdrawal_id uuid,_action text,_note text DEFAULT '') RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF NOT public.has_role(_actor_id,'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF; PERFORM public.admin_review_withdrawal(_withdrawal_id,_action,_note); END; $$;
CREATE OR REPLACE FUNCTION public.admin_set_member_state(_actor_id uuid,_user_id uuid,_account_status text DEFAULT NULL,_is_active boolean DEFAULT NULL,_kyc_status text DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF NOT public.has_role(_actor_id,'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF; IF _account_status IS NOT NULL AND _account_status NOT IN ('active','inactive','suspended','banned') THEN RAISE EXCEPTION 'Invalid account status'; END IF; IF _kyc_status IS NOT NULL AND _kyc_status NOT IN ('pending','approved','rejected') THEN RAISE EXCEPTION 'Invalid KYC status'; END IF; UPDATE public.profiles SET account_status=coalesce(_account_status,account_status),is_active=coalesce(_is_active,is_active),kyc_status=coalesce(_kyc_status,kyc_status) WHERE id=_user_id; END; $$;
CREATE OR REPLACE FUNCTION public.admin_upsert_product(_actor_id uuid,_id uuid,_name text,_description text,_category text,_image_url text,_mrp numeric,_direct_commission numeric,_pair_bonus numeric,_stock integer,_status text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF NOT public.has_role(_actor_id,'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF; IF _status NOT IN ('active','inactive') THEN RAISE EXCEPTION 'Invalid product status'; END IF; IF _id IS NULL THEN INSERT INTO public.products(name,description,category,image_url,mrp,direct_commission,pair_bonus,stock,status) VALUES(trim(_name),coalesce(_description,''),coalesce(_category,'General'),coalesce(_image_url,''),_mrp,_direct_commission,_pair_bonus,_stock,_status); ELSE UPDATE public.products SET name=trim(_name),description=coalesce(_description,''),category=coalesce(_category,'General'),image_url=coalesce(_image_url,''),mrp=_mrp,direct_commission=_direct_commission,pair_bonus=_pair_bonus,stock=_stock,status=_status WHERE id=_id; END IF; END; $$;
CREATE OR REPLACE FUNCTION public.admin_update_plan_settings(_actor_id uuid,_min_withdrawal numeric,_tds_percent numeric,_admin_charge numeric,_withdrawal_days integer,_daily_pair_cap integer,_refund_days integer,_monthly_repurchase boolean,_upi_id text,_payment_account_name text,_qr_image_url text,_qr_image_path text DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN IF NOT public.has_role(_actor_id,'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF; UPDATE public.plan_settings SET min_withdrawal=_min_withdrawal,tds_percent=_tds_percent,admin_charge=_admin_charge,withdrawal_days=_withdrawal_days,daily_pair_cap=_daily_pair_cap,refund_days=_refund_days,monthly_repurchase=_monthly_repurchase,upi_id=trim(_upi_id),payment_account_name=trim(_payment_account_name),qr_image_url=_qr_image_url,qr_image_path=_qr_image_path,updated_at=now() WHERE id=1; END; $$;
CREATE OR REPLACE FUNCTION public.claim_member_reward(_user_id uuid,_level integer) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN PERFORM public.claim_reward(_user_id,_level); END; $$;
CREATE OR REPLACE FUNCTION public.expire_member_rewards(_user_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN PERFORM public.expire_due_rewards(_user_id); END; $$;

REVOKE ALL ON FUNCTION public.register_member(text,text,text,date,text,text,text,boolean,boolean) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.get_member_direct_team(uuid) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.get_member_tree_rows(uuid) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.admin_review_order_hosted(uuid,uuid,text,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.admin_review_withdrawal_hosted(uuid,uuid,text,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.admin_set_member_state(uuid,uuid,text,boolean,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.admin_upsert_product(uuid,uuid,text,text,text,text,numeric,numeric,numeric,integer,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.admin_update_plan_settings(uuid,numeric,numeric,numeric,integer,integer,integer,boolean,text,text,text,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.claim_member_reward(uuid,integer) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.expire_member_rewards(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.register_member(text,text,text,date,text,text,text,boolean,boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_member_direct_team(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_member_tree_rows(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_review_order_hosted(uuid,uuid,text,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_review_withdrawal_hosted(uuid,uuid,text,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_set_member_state(uuid,uuid,text,boolean,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_upsert_product(uuid,uuid,text,text,text,text,numeric,numeric,numeric,integer,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_plan_settings(uuid,numeric,numeric,numeric,integer,integer,integer,boolean,text,text,text,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_member_reward(uuid,integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.expire_member_rewards(uuid) TO service_role;