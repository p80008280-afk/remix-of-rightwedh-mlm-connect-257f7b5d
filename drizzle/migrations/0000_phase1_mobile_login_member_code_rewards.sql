ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS member_code TEXT,
  ADD COLUMN IF NOT EXISTS dob DATE,
  ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS address_line TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS pincode TEXT DEFAULT '';

CREATE OR REPLACE FUNCTION public.generate_member_code()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE code TEXT; taken BOOLEAN;
BEGIN
  LOOP
    code := 'RS-' || lpad((floor(random()*900000)+100000)::int::text, 6, '0');
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE member_code = code) INTO taken;
    IF NOT taken THEN RETURN code; END IF;
  END LOOP;
END; $$;

UPDATE public.profiles SET member_code = public.generate_member_code() WHERE member_code IS NULL;

ALTER TABLE public.profiles ALTER COLUMN member_code SET DEFAULT public.generate_member_code();
ALTER TABLE public.profiles ALTER COLUMN member_code SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_member_code_key ON public.profiles(member_code);

CREATE TABLE IF NOT EXISTS public.reward_levels (
  level INT PRIMARY KEY,
  pairs_required INT NOT NULL,
  amount NUMERIC NOT NULL
);
GRANT SELECT ON public.reward_levels TO authenticated;
GRANT SELECT ON public.reward_levels TO anon;
GRANT ALL ON public.reward_levels TO service_role;
ALTER TABLE public.reward_levels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone reads reward levels" ON public.reward_levels;
CREATE POLICY "Anyone reads reward levels" ON public.reward_levels FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.reward_levels (level, pairs_required, amount) VALUES
 (1,1,100),(2,2,200),(3,4,300),(4,8,500),(5,16,800),(6,32,1200),
 (7,64,2000),(8,128,3500),(9,256,6600),(10,512,12000),(11,1024,22000),(12,2048,40000),
 (13,4096,75000),(14,8192,140000),(15,16384,270000),(16,32768,540000),(17,65536,1200000),(18,131072,3388800)
ON CONFLICT (level) DO UPDATE SET pairs_required = EXCLUDED.pairs_required, amount = EXCLUDED.amount;

CREATE TABLE IF NOT EXISTS public.user_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level INT NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, level)
);
GRANT SELECT ON public.user_rewards TO authenticated;
GRANT ALL ON public.user_rewards TO service_role;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own rewards" ON public.user_rewards;
CREATE POLICY "Users read own rewards" ON public.user_rewards FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins read all rewards" ON public.user_rewards;
CREATE POLICY "Admins read all rewards" ON public.user_rewards FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.credit_rewards(_user_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_pairs INT; r RECORD;
BEGIN
  SELECT matched_pairs INTO v_pairs FROM public.tree_stats WHERE user_id = _user_id;
  IF v_pairs IS NULL THEN RETURN; END IF;
  FOR r IN SELECT * FROM public.reward_levels WHERE pairs_required <= v_pairs ORDER BY level LOOP
    IF NOT EXISTS (SELECT 1 FROM public.user_rewards WHERE user_id = _user_id AND level = r.level) THEN
      INSERT INTO public.user_rewards (user_id, level, amount) VALUES (_user_id, r.level, r.amount);
      INSERT INTO public.commissions (user_id, type, amount, note)
      VALUES (_user_id, 'reward', r.amount, 'Level ' || r.level || ' reward (' || r.pairs_required || ' pairs)');
      UPDATE public.wallets
      SET balance = balance + r.amount, total_earned = total_earned + r.amount, updated_at = now()
      WHERE user_id = _user_id;
    END IF;
  END LOOP;
END; $$;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS quantity INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS ship_name TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS ship_phone TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS ship_address TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS ship_city TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS ship_state TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS ship_pincode TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS cart_group UUID;