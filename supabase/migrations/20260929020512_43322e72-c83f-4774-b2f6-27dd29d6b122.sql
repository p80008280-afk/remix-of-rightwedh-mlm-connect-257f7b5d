CREATE OR REPLACE FUNCTION public.resolve_member_login(_identifier text)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_identifier text := lower(trim(_identifier));
  v_email text;
  v_count integer;
BEGIN
  IF v_identifier IS NULL OR v_identifier = '' THEN
    RAISE EXCEPTION 'Enter your mobile number, username, or Member ID';
  END IF;

  IF position('@' in v_identifier) > 1 THEN
    RETURN v_identifier;
  END IF;

  SELECT count(*), min(u.email)
  INTO v_count, v_email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE lower(coalesce(p.username, '')) = v_identifier
     OR lower(coalesce(p.member_code, '')) = v_identifier;

  IF v_count = 1 THEN
    RETURN v_email;
  ELSIF v_count > 1 THEN
    RAISE EXCEPTION 'More than one account matches. Please use your unique Member ID.';
  END IF;

  SELECT count(*), min(u.email)
  INTO v_count, v_email
  FROM public.profiles p
  JOIN auth.users u ON u.id = p.id
  WHERE regexp_replace(coalesce(p.phone, ''), '[^0-9]', '', 'g') = regexp_replace(v_identifier, '[^0-9]', '', 'g');

  IF v_count = 1 THEN
    RETURN v_email;
  ELSIF v_count > 1 THEN
    RAISE EXCEPTION 'This mobile number is linked to multiple accounts. Please use your unique Member ID.';
  END IF;

  RETURN v_identifier || '@rs.local';
END;
$$;

REVOKE ALL ON FUNCTION public.resolve_member_login(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.resolve_member_login(text) TO anon, authenticated, service_role;