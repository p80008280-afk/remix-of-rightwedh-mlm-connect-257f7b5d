
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Admin read policy for roles
CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  referral_code TEXT UNIQUE NOT NULL,
  sponsor_id UUID REFERENCES public.profiles(id),
  parent_id UUID REFERENCES public.profiles(id),
  position TEXT CHECK (position IN ('left','right')),
  upi_id TEXT DEFAULT '',
  kyc_status TEXT NOT NULL DEFAULT 'pending',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users read team profiles" ON public.profiles FOR SELECT TO authenticated USING (sponsor_id = auth.uid() OR parent_id = auth.uid());
CREATE POLICY "Admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ WALLETS ============
CREATE TABLE public.wallets (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_earned NUMERIC(12,2) NOT NULL DEFAULT 0,
  direct_income NUMERIC(12,2) NOT NULL DEFAULT 0,
  pair_income NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wallets TO authenticated;
GRANT ALL ON public.wallets TO service_role;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own wallet" ON public.wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all wallets" ON public.wallets FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ TREE STATS (for pair matching) ============
CREATE TABLE public.tree_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  left_count INT NOT NULL DEFAULT 0,
  right_count INT NOT NULL DEFAULT 0,
  matched_pairs INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tree_stats TO authenticated;
GRANT ALL ON public.tree_stats TO service_role;
ALTER TABLE public.tree_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own tree stats" ON public.tree_stats FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all tree stats" ON public.tree_stats FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'General',
  image_url TEXT DEFAULT '',
  mrp NUMERIC(10,2) NOT NULL,
  direct_commission NUMERIC(10,2) NOT NULL DEFAULT 0,
  pair_bonus NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads active products" ON public.products FOR SELECT TO anon, authenticated USING (status = 'active' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ============ ORDERS ============
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  upi_reference TEXT DEFAULT '',
  payment_method TEXT DEFAULT 'upi',
  admin_note TEXT DEFAULT '',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ COMMISSIONS ============
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_user_id UUID REFERENCES auth.users(id),
  order_id UUID REFERENCES public.orders(id),
  type TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.commissions TO authenticated;
GRANT ALL ON public.commissions TO service_role;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own commissions" ON public.commissions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all commissions" ON public.commissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ WITHDRAWALS ============
CREATE TABLE public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  upi_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT DEFAULT '',
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.withdrawals TO authenticated;
GRANT ALL ON public.withdrawals TO service_role;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own withdrawals" ON public.withdrawals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own withdrawals" ON public.withdrawals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins read all withdrawals" ON public.withdrawals FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update withdrawals" ON public.withdrawals FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ FUNCTIONS ============

-- Generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    code := 'RS' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists_check;
    IF NOT exists_check THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$;

-- Auto create profile + wallet on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_sponsor_code TEXT;
  v_sponsor_id UUID;
  v_position TEXT;
  v_parent_id UUID;
BEGIN
  v_sponsor_code := NEW.raw_user_meta_data->>'sponsor_code';
  v_position := COALESCE(NEW.raw_user_meta_data->>'position', 'left');
  IF v_position NOT IN ('left','right') THEN v_position := 'left'; END IF;

  IF v_sponsor_code IS NOT NULL AND v_sponsor_code <> '' THEN
    SELECT id INTO v_sponsor_id FROM public.profiles WHERE referral_code = upper(v_sponsor_code);
  END IF;

  -- parent placement: walk down sponsor's chosen leg until empty
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

  INSERT INTO public.profiles (id, full_name, phone, email, referral_code, sponsor_id, parent_id, position)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.email,
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
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Process order approval: pay direct commission + pair matching up the tree
CREATE OR REPLACE FUNCTION public.process_order_approval(_order_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_order RECORD;
  v_product RECORD;
  v_buyer RECORD;
  v_sponsor_id UUID;
  v_current UUID;
  v_parent UUID;
  v_side TEXT;
  v_stats RECORD;
  v_new_pairs INT;
  v_pair_amount NUMERIC;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = _order_id;
  IF v_order.status <> 'approved' THEN RETURN; END IF;

  SELECT * INTO v_product FROM public.products WHERE id = v_order.product_id;
  SELECT * INTO v_buyer FROM public.profiles WHERE id = v_order.user_id;

  -- Activate buyer if inactive
  UPDATE public.profiles SET is_active = true WHERE id = v_buyer.id;

  -- 1) Direct commission to sponsor
  v_sponsor_id := v_buyer.sponsor_id;
  IF v_sponsor_id IS NOT NULL AND v_product.direct_commission > 0 THEN
    INSERT INTO public.commissions (user_id, from_user_id, order_id, type, amount, note)
    VALUES (v_sponsor_id, v_buyer.id, _order_id, 'direct', v_product.direct_commission,
            'Direct sale of ' || v_product.name);
    UPDATE public.wallets
      SET balance = balance + v_product.direct_commission,
          total_earned = total_earned + v_product.direct_commission,
          direct_income = direct_income + v_product.direct_commission,
          updated_at = now()
      WHERE user_id = v_sponsor_id;
  END IF;

  -- 2) Pair matching: walk up tree from buyer, update counts on each ancestor
  v_current := v_buyer.id;
  LOOP
    SELECT parent_id, position INTO v_parent, v_side FROM public.profiles WHERE id = v_current;
    EXIT WHEN v_parent IS NULL OR v_side IS NULL;

    IF v_side = 'left' THEN
      UPDATE public.tree_stats SET left_count = left_count + 1, updated_at = now() WHERE user_id = v_parent;
    ELSE
      UPDATE public.tree_stats SET right_count = right_count + 1, updated_at = now() WHERE user_id = v_parent;
    END IF;

    SELECT * INTO v_stats FROM public.tree_stats WHERE user_id = v_parent;
    v_new_pairs := LEAST(v_stats.left_count, v_stats.right_count) - v_stats.matched_pairs;

    IF v_new_pairs > 0 AND v_product.pair_bonus > 0 THEN
      v_pair_amount := v_new_pairs * v_product.pair_bonus;
      UPDATE public.tree_stats SET matched_pairs = matched_pairs + v_new_pairs WHERE user_id = v_parent;
      INSERT INTO public.commissions (user_id, from_user_id, order_id, type, amount, note)
      VALUES (v_parent, v_buyer.id, _order_id, 'pair', v_pair_amount,
              v_new_pairs || ' new pair(s) matched');
      UPDATE public.wallets
        SET balance = balance + v_pair_amount,
            total_earned = total_earned + v_pair_amount,
            pair_income = pair_income + v_pair_amount,
            updated_at = now()
        WHERE user_id = v_parent;
    END IF;

    v_current := v_parent;
  END LOOP;

  UPDATE public.orders SET processed_at = now() WHERE id = _order_id;
END;
$$;

-- Deduct wallet on withdrawal approval
CREATE OR REPLACE FUNCTION public.process_withdrawal_approval(_withdrawal_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_w RECORD;
  v_bal NUMERIC;
BEGIN
  SELECT * INTO v_w FROM public.withdrawals WHERE id = _withdrawal_id;
  IF v_w.status <> 'approved' THEN RETURN; END IF;

  SELECT balance INTO v_bal FROM public.wallets WHERE user_id = v_w.user_id;
  IF v_bal < v_w.amount THEN RAISE EXCEPTION 'Insufficient balance'; END IF;

  UPDATE public.wallets SET balance = balance - v_w.amount, updated_at = now() WHERE user_id = v_w.user_id;
  UPDATE public.withdrawals SET processed_at = now() WHERE id = _withdrawal_id;
END;
$$;

-- ============ SEED PRODUCTS ============
INSERT INTO public.products (name, description, category, mrp, direct_commission, pair_bonus, stock) VALUES
('Aaurva Immunity Capsule', 'Premium herbal immunity booster with Ashwagandha, Giloy, Tulsi. 60 capsules.', 'Immunity', 3250, 900, 300, 500),
('Immuno Shakti Syrup', 'Ayurvedic immunity syrup with 15 herbs for daily wellness. 200ml.', 'Immunity', 3250, 900, 300, 300),
('Detox Plus Churna', 'Natural digestive cleanser with Triphala and rare herbs. 100gm.', 'Detox', 3250, 900, 300, 400),
('Kesh Vardhak Hair Oil', 'Bhringraj + Amla + Brahmi hair oil for strength and shine. 200ml.', 'Hair Care', 3250, 900, 300, 250),
('Twak Glow Face Cream', 'Kumkumadi + Saffron face cream for glowing skin. 50gm.', 'Skin Care', 3250, 900, 300, 200),
('Joint Relief Oil', 'Ayurvedic joint pain relief oil with Mahanarayan formulation. 100ml.', 'Wellness', 3250, 900, 300, 350);
