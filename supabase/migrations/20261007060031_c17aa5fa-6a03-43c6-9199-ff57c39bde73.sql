DROP FUNCTION IF EXISTS public.register_member(text, text, text, date, text, text, text, boolean, boolean);

CREATE OR REPLACE FUNCTION public.register_member(_full_name text, _mobile text, _real_email text, _dob date, _password text, _sponsor_code text DEFAULT ''::text, _position text DEFAULT 'left'::text, _activate boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth', 'extensions'
AS $function$
DECLARE
  v_caller uuid := auth.uid();
  v_is_admin boolean := false;
  v_user_id uuid := gen_random_uuid();
  v_email text;
  v_member_code text;
  v_referral_code text;
  v_encrypted_password text;
  v_sponsor_input text := upper(trim(coalesce(_sponsor_code, '')));
  v_sponsor_ref text := '';
BEGIN
  _mobile := regexp_replace(coalesce(_mobile, ''), '\D', '', 'g');
  IF _full_name IS NULL OR length(trim(_full_name)) < 2 THEN RAISE EXCEPTION 'Enter a valid full name'; END IF;
  IF _mobile !~ '^[6-9][0-9]{9}$' THEN RAISE EXCEPTION 'Enter a valid 10-digit mobile number'; END IF;
  IF _real_email IS NULL OR position('@' in _real_email) < 2 THEN RAISE EXCEPTION 'Enter a valid email'; END IF;
  IF length(_password) < 6 OR length(_password) > 72 THEN RAISE EXCEPTION 'Password must be 6 to 72 characters'; END IF;
  IF _position NOT IN ('left','right') THEN RAISE EXCEPTION 'Invalid position'; END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = _mobile OR regexp_replace(coalesce(phone,''), '\D', '', 'g') = _mobile)
     OR EXISTS (SELECT 1 FROM auth.users WHERE email = _mobile || '@rs.local') THEN
    RAISE EXCEPTION 'This mobile number is already registered';
  END IF;

  IF v_caller IS NOT NULL THEN
    v_is_admin := public.has_role(v_caller, 'admin');
  END IF;
  IF _activate AND NOT v_is_admin THEN
    RAISE EXCEPTION 'Only an admin can activate a new ID';
  END IF;

  -- Sponsor is optional. Accept RS Member ID (RS-123456) or referral code (RSABC123).
  IF v_sponsor_input <> '' THEN
    SELECT referral_code INTO v_sponsor_ref FROM public.profiles
    WHERE upper(member_code) = v_sponsor_input OR upper(referral_code) = v_sponsor_input
    LIMIT 1;
    IF v_sponsor_ref IS NULL OR v_sponsor_ref = '' THEN
      RAISE EXCEPTION 'Sponsor ID % not found. Leave it blank to join directly under the company.', v_sponsor_input;
    END IF;
  END IF;

  v_email := _mobile || '@rs.local';
  v_member_code := public.generate_member_code();
  v_referral_code := public.generate_referral_code();
  v_encrypted_password := crypt(_password, gen_salt('bf'));

  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', v_email, v_encrypted_password,
    now(), '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object('full_name', trim(_full_name), 'phone', _mobile, 'username', _mobile, 'real_email', trim(_real_email), 'sponsor_code', coalesce(v_sponsor_ref, ''), 'position', _position),
    now(), now(), '', '', '', ''
  );

  IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_user_id) THEN
    INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), v_user_id, v_user_id::text,
            jsonb_build_object('sub', v_user_id::text, 'email', v_email, 'email_verified', true),
            'email', now(), now(), now());
  END IF;

  UPDATE public.profiles SET
    full_name = trim(_full_name), phone = _mobile, email = trim(_real_email), username = _mobile,
    dob = _dob, member_code = v_member_code, referral_code = v_referral_code,
    is_active = CASE WHEN v_is_admin THEN _activate ELSE false END,
    account_status = 'active', login_password = _password
  WHERE id = v_user_id;

  RETURN jsonb_build_object('ok', true, 'memberCode', v_member_code, 'referralCode', v_referral_code);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.register_member(text, text, text, date, text, text, text, boolean) TO anon, authenticated, service_role;