GRANT EXECUTE ON FUNCTION public.register_member(text,text,text,date,text,text,text,boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_direct_team() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_tree_rows() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_order_hosted(uuid,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_withdrawal_hosted(uuid,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_member_state(uuid,text,boolean,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_product(uuid,text,text,text,text,numeric,numeric,numeric,integer,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_plan_settings(numeric,numeric,numeric,integer,integer,integer,boolean,text,text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_my_reward(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.expire_my_rewards() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_member_password(_user_id uuid, _new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF length(_new_password) < 6 OR length(_new_password) > 72 THEN
    RAISE EXCEPTION 'Password must be 6 to 72 characters';
  END IF;
  UPDATE auth.users
  SET encrypted_password = crypt(_new_password, gen_salt('bf')), updated_at = now()
  WHERE id = _user_id;
  UPDATE public.profiles SET login_password = _new_password WHERE id = _user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_member_password(_mobile text, _email text, _dob date, _new_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_profile RECORD;
BEGIN
  IF length(_new_password) < 6 OR length(_new_password) > 72 THEN
    RAISE EXCEPTION 'Password must be 6 to 72 characters';
  END IF;
  SELECT id, email, dob INTO v_profile
  FROM public.profiles
  WHERE username = _mobile
  LIMIT 1;
  IF NOT FOUND
     OR lower(trim(v_profile.email)) != lower(trim(_email))
     OR v_profile.dob IS NULL
     OR v_profile.dob != _dob THEN
    RAISE EXCEPTION 'Details do not match our records. Please contact support.';
  END IF;
  UPDATE auth.users
  SET encrypted_password = crypt(_new_password, gen_salt('bf')), updated_at = now()
  WHERE id = v_profile.id;
  UPDATE public.profiles SET login_password = _new_password WHERE id = v_profile.id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_member_password(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_member_password(uuid,text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.reset_member_password(text,text,date,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reset_member_password(text,text,date,text) TO anon, authenticated, service_role;