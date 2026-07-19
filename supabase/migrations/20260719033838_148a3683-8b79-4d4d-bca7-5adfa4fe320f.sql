DROP POLICY IF EXISTS "Anyone reads active products" ON public.products;
CREATE POLICY "Anyone reads active products"
ON public.products
FOR SELECT
TO anon, authenticated
USING (status = 'active');

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;