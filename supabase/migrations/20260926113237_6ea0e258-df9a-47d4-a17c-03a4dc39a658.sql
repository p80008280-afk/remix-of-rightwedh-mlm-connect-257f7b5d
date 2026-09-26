UPDATE public.reward_levels AS r
SET base_amount = v.reward_amount,
    gst_percent = 0,
    amount = v.reward_amount,
    title = CASE WHEN v.level = 18 THEN 'The King 👑' ELSE '' END
FROM (VALUES
  (1,100::numeric),(2,150),(3,150),(4,150),(5,200),(6,250),
  (7,300),(8,350),(9,400),(10,1100),(11,2100),(12,9300),
  (13,18000),(14,22500),(15,72000),(16,200000),(17,400000),(18,2000000)
) AS v(level, reward_amount)
WHERE r.level = v.level;

UPDATE public.user_rewards AS ur
SET amount = rl.amount
FROM public.reward_levels AS rl
WHERE ur.level = rl.level
  AND ur.status = 'available';