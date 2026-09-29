REVOKE ALL ON FUNCTION public.resolve_member_login(text) FROM anon, authenticated, service_role;
DROP FUNCTION public.resolve_member_login(text);

CREATE TABLE public.login_aliases (
  identifier_hash text PRIMARY KEY,
  auth_email text NOT NULL
);
GRANT SELECT ON public.login_aliases TO anon, authenticated;
GRANT ALL ON public.login_aliases TO service_role;
ALTER TABLE public.login_aliases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Login aliases are readable for sign in"
ON public.login_aliases
FOR SELECT
TO anon, authenticated
USING (true);

INSERT INTO public.login_aliases (identifier_hash, auth_email)
SELECT encode(extensions.digest(lower(trim(p.username)), 'sha256'), 'hex'), lower(u.email)
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE nullif(trim(p.username), '') IS NOT NULL
ON CONFLICT (identifier_hash) DO UPDATE SET auth_email = excluded.auth_email;

INSERT INTO public.login_aliases (identifier_hash, auth_email)
SELECT encode(extensions.digest(lower(trim(p.member_code)), 'sha256'), 'hex'), lower(u.email)
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE nullif(trim(p.member_code), '') IS NOT NULL
ON CONFLICT (identifier_hash) DO UPDATE SET auth_email = excluded.auth_email;

INSERT INTO public.login_aliases (identifier_hash, auth_email)
SELECT encode(extensions.digest(regexp_replace(p.phone, '[^0-9]', '', 'g'), 'sha256'), 'hex'), min(lower(u.email))
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE nullif(regexp_replace(p.phone, '[^0-9]', '', 'g'), '') IS NOT NULL
GROUP BY regexp_replace(p.phone, '[^0-9]', '', 'g')
HAVING count(*) = 1
ON CONFLICT (identifier_hash) DO UPDATE SET auth_email = excluded.auth_email;

CREATE OR REPLACE FUNCTION public.sync_login_aliases()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_email text;
  v_phone text;
BEGIN
  SELECT lower(email) INTO v_email FROM auth.users WHERE id = NEW.id;
  IF v_email IS NULL THEN RETURN NEW; END IF;

  IF nullif(trim(NEW.username), '') IS NOT NULL THEN
    INSERT INTO public.login_aliases(identifier_hash, auth_email)
    VALUES (encode(extensions.digest(lower(trim(NEW.username)), 'sha256'), 'hex'), v_email)
    ON CONFLICT (identifier_hash) DO UPDATE SET auth_email = excluded.auth_email;
  END IF;

  IF nullif(trim(NEW.member_code), '') IS NOT NULL THEN
    INSERT INTO public.login_aliases(identifier_hash, auth_email)
    VALUES (encode(extensions.digest(lower(trim(NEW.member_code)), 'sha256'), 'hex'), v_email)
    ON CONFLICT (identifier_hash) DO UPDATE SET auth_email = excluded.auth_email;
  END IF;

  v_phone := regexp_replace(coalesce(NEW.phone, ''), '[^0-9]', '', 'g');
  IF v_phone <> '' AND (SELECT count(*) FROM public.profiles WHERE regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') = v_phone) = 1 THEN
    INSERT INTO public.login_aliases(identifier_hash, auth_email)
    VALUES (encode(extensions.digest(v_phone, 'sha256'), 'hex'), v_email)
    ON CONFLICT (identifier_hash) DO UPDATE SET auth_email = excluded.auth_email;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.sync_login_aliases() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_login_aliases() TO service_role;

CREATE TRIGGER sync_profile_login_aliases
AFTER INSERT OR UPDATE OF username, member_code, phone ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_login_aliases();

CREATE OR REPLACE FUNCTION public.admin_register_member_hosted(
  _full_name text,
  _mobile text,
  _real_email text,
  _dob date,
  _password text,
  _sponsor_code text DEFAULT '',
  _position text DEFAULT 'left',
  _activate boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  RETURN public.register_member(_full_name, _mobile, _real_email, _dob, _password, _sponsor_code, _position, _activate);
END;
$$;
REVOKE ALL ON FUNCTION public.admin_register_member_hosted(text,text,text,date,text,text,text,boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_register_member_hosted(text,text,text,date,text,text,text,boolean) TO authenticated, service_role;