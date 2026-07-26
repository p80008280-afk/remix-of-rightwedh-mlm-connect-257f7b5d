CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique_lower_idx
ON public.profiles (lower(username))
WHERE username IS NOT NULL AND username <> '';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_sponsor_code TEXT;
  v_sponsor_id UUID;
  v_position TEXT;
  v_parent_id UUID;
  v_username TEXT;
  v_real_email TEXT;
BEGIN
  v_sponsor_code := NEW.raw_user_meta_data->>'sponsor_code';
  v_position := COALESCE(NEW.raw_user_meta_data->>'position', 'left');
  v_username := lower(NULLIF(trim(NEW.raw_user_meta_data->>'username'), ''));
  v_real_email := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'real_email', NEW.email)), '');

  IF v_position NOT IN ('left','right') THEN
    v_position := 'left';
  END IF;

  IF v_sponsor_code IS NOT NULL AND v_sponsor_code <> '' THEN
    SELECT id INTO v_sponsor_id
    FROM public.profiles
    WHERE referral_code = upper(v_sponsor_code)
    LIMIT 1;
  END IF;

  IF v_sponsor_id IS NOT NULL THEN
    v_parent_id := v_sponsor_id;
    LOOP
      DECLARE
        v_child UUID;
      BEGIN
        SELECT id INTO v_child
        FROM public.profiles
        WHERE parent_id = v_parent_id AND position = v_position
        LIMIT 1;

        EXIT WHEN v_child IS NULL;
        v_parent_id := v_child;
      END;
    END LOOP;
  END IF;

  INSERT INTO public.profiles (
    id,
    full_name,
    phone,
    email,
    username,
    referral_code,
    sponsor_id,
    parent_id,
    position
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(v_real_email, NEW.email),
    v_username,
    public.generate_referral_code(),
    v_sponsor_id,
    v_parent_id,
    CASE WHEN v_sponsor_id IS NULL THEN NULL ELSE v_position END
  );

  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.tree_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.grant_admin_for_owner_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF lower(NEW.email) = 'adnanzaidi778@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created_create_profile ON auth.users;
CREATE TRIGGER on_auth_user_created_create_profile
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_created_grant_owner_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_owner_admin
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.grant_admin_for_owner_email();

DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE lower(email) = 'adnanzaidi778@gmail.com'
  LIMIT 1;

  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_admin_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;