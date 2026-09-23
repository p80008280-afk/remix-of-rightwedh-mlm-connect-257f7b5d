ALTER TABLE public.reward_levels ADD COLUMN IF NOT EXISTS base_amount numeric NOT NULL DEFAULT 0;
ALTER TABLE public.reward_levels ADD COLUMN IF NOT EXISTS gst_percent numeric NOT NULL DEFAULT 18;
ALTER TABLE public.reward_levels ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT '';

UPDATE public.reward_levels AS r
SET base_amount = v.base, gst_percent = 18, amount = round(v.base * 1.18, 2),
    title = CASE WHEN v.level = 18 THEN 'The King 👑' ELSE '' END
FROM (VALUES (1,100),(2,150),(3,150),(4,150),(5,200),(6,250),(7,300),(8,350),(9,400),(10,1100),(11,2100),(12,9300),(13,18000),(14,22500),(15,72000),(16,200000),(17,400000),(18,2000000)) AS v(level, base)
WHERE r.level = v.level;