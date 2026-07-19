ALTER TABLE public.plan_settings
  ADD COLUMN IF NOT EXISTS upi_id text NOT NULL DEFAULT 'kartiktirgar@ybl',
  ADD COLUMN IF NOT EXISTS payment_account_name text NOT NULL DEFAULT 'KARTIK TIRGAR',
  ADD COLUMN IF NOT EXISTS qr_image_url text NOT NULL DEFAULT '/__l5e/assets-v1/c98ad5c5-ca76-47f1-b508-9821e84b7f14/phonepe-qr.png';

UPDATE public.plan_settings
SET upi_id = COALESCE(NULLIF(upi_id, ''), 'kartiktirgar@ybl'),
    payment_account_name = COALESCE(NULLIF(payment_account_name, ''), 'KARTIK TIRGAR'),
    qr_image_url = COALESCE(NULLIF(qr_image_url, ''), '/__l5e/assets-v1/c98ad5c5-ca76-47f1-b508-9821e84b7f14/phonepe-qr.png'),
    updated_at = now()
WHERE id = 1;

UPDATE public.products
SET image_url = '/__l5e/assets-v1/95e7996a-1b25-4b71-a42d-658847399afa/aaurva-capsule.png'
WHERE COALESCE(image_url, '') = '';

-- Keep settings visible to users for checkout/withdrawal rules, and editable only by admins through existing RLS policies.
GRANT SELECT ON public.plan_settings TO anon, authenticated;
GRANT UPDATE ON public.plan_settings TO authenticated;
GRANT ALL ON public.plan_settings TO service_role;