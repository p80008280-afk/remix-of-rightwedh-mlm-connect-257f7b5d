CREATE OR REPLACE FUNCTION public.resolve_member_login(_identifier text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_identifier text := lower(regexp_replace(trim(coalesce(_identifier, '')), '\s+', '', 'g'));
  v_auth_email text;
  v_count integer;
BEGIN
  IF v_identifier = '' THEN
    RAISE EXCEPTION 'Enter your Mobile Number, User ID, or Username';
  END IF;

  SELECT count(*), min(u.email)
  INTO v_count, v_auth_email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE lower(coalesce(p.member_code, '')) = v_identifier
     OR lower(coalesce(p.username, '')) = v_identifier
     OR regexp_replace(coalesce(p.phone, ''), '\D', '', 'g') = regexp_replace(v_identifier, '\D', '', 'g');

  IF v_count = 0 OR v_auth_email IS NULL THEN
    RAISE EXCEPTION 'Member ID or mobile number was not found';
  END IF;

  IF v_count > 1 THEN
    RAISE EXCEPTION 'More than one ID uses this mobile number. Login with your User ID.';
  END IF;

  RETURN v_auth_email;
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_member_login(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_member_login(text) TO anon, authenticated, service_role;