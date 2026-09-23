UPDATE public.reward_levels AS r SET amount = v.amount
FROM (VALUES (1,100),(2,150),(3,150),(4,150),(5,200),(6,250),(7,300),(8,350),(9,400),(10,1100),(11,2100),(12,9300),(13,18000),(14,22500),(15,72000),(16,200000),(17,400000),(18,2000000)) AS v(level, amount)
WHERE r.level = v.level;