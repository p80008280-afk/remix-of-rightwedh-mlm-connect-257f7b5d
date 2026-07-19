ALTER TABLE public.plan_settings
  ADD COLUMN IF NOT EXISTS qr_image_path text NOT NULL DEFAULT 'default/phonepe-qr.png';

UPDATE public.plan_settings
SET qr_image_path = COALESCE(NULLIF(qr_image_path, ''), 'default/phonepe-qr.png'),
    updated_at = now()
WHERE id = 1;

CREATE POLICY "Signed-in users can read payment QR assets"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'payment-assets');

CREATE POLICY "Admins upload payment QR assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'payment-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update payment QR assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'payment-assets' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'payment-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete payment QR assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'payment-assets' AND public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.plan_settings TO anon, authenticated;
GRANT UPDATE ON public.plan_settings TO authenticated;
GRANT ALL ON public.plan_settings TO service_role;