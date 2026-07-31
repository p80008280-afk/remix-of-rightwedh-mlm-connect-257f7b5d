DROP POLICY IF EXISTS "Public can read plan settings" ON public.plan_settings;
CREATE POLICY "Signed-in users read plan settings"
ON public.plan_settings
FOR SELECT
TO authenticated
USING (true);
REVOKE SELECT ON public.plan_settings FROM anon;
GRANT SELECT ON public.plan_settings TO authenticated;

DROP POLICY IF EXISTS "Users read team profiles" ON public.profiles;

CREATE OR REPLACE FUNCTION public.get_my_direct_team()
RETURNS TABLE (
  id uuid,
  full_name text,
  referral_code text,
  member_position text,
  created_at timestamptz,
  is_active boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.referral_code, p.position AS member_position, p.created_at, p.is_active
  FROM public.profiles p
  WHERE p.sponsor_id = auth.uid()
  ORDER BY p.created_at DESC
$$;
REVOKE ALL ON FUNCTION public.get_my_direct_team() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_direct_team() TO authenticated;