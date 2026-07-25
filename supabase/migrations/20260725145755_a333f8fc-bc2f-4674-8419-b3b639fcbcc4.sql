ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_key ON public.profiles (lower(username)) WHERE username IS NOT NULL;

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
BEGIN
  v_sponsor_code := NEW.raw_user_meta_data->>'sponsor_code';
  v_position := COALESCE(NEW.raw_user_meta_data->>'position', 'left');
  v_username := NEW.raw_user_meta_data->>'username';
  IF v_position NOT IN ('left','right') THEN v_position := 'left'; END IF;

  IF v_sponsor_code IS NOT NULL AND v_sponsor_code <> '' THEN
    SELECT id INTO v_sponsor_id FROM public.profiles WHERE referral_code = upper(v_sponsor_code);
  END IF;

  IF v_sponsor_id IS NOT NULL THEN
    v_parent_id := v_sponsor_id;
    LOOP
      DECLARE
        v_child UUID;
      BEGIN
        SELECT id INTO v_child FROM public.profiles WHERE parent_id = v_parent_id AND position = v_position LIMIT 1;
        EXIT WHEN v_child IS NULL;
        v_parent_id := v_child;
      END;
    END LOOP;
  END IF;

  INSERT INTO public.profiles (id, full_name, phone, email, username, referral_code, sponsor_id, parent_id, position)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.email,
    v_username,
    public.generate_referral_code(),
    v_sponsor_id,
    v_parent_id,
    CASE WHEN v_sponsor_id IS NULL THEN NULL ELSE v_position END
  );

  INSERT INTO public.wallets (user_id) VALUES (NEW.id);
  INSERT INTO public.tree_stats (user_id) VALUES (NEW.id);
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'member') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$function$;

-- Allow anyone to look up username -> synthetic email mapping? No, we build synthetic email client-side.
