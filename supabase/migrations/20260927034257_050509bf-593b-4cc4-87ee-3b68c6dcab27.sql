ALTER FUNCTION public.admin_set_member_password(uuid, text) SET search_path = public, auth, extensions;
ALTER FUNCTION public.reset_member_password(text, text, date, text) SET search_path = public, auth, extensions;
ALTER FUNCTION public.register_member(text, text, text, date, text, text, text, boolean) SET search_path = public, auth, extensions;
ALTER FUNCTION public.register_member(text, text, text, date, text, text, text, boolean, boolean) SET search_path = public, auth, extensions;