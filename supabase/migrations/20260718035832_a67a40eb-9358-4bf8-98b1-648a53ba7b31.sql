
-- Add payment screenshot column
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT;

-- Add daily pair capping tracker on tree_stats
ALTER TABLE public.tree_stats ADD COLUMN IF NOT EXISTS pairs_today INT NOT NULL DEFAULT 0;
ALTER TABLE public.tree_stats ADD COLUMN IF NOT EXISTS pairs_day DATE NOT NULL DEFAULT CURRENT_DATE;

-- Plan settings table (single-row config; admin editable)
CREATE TABLE IF NOT EXISTS public.plan_settings (
  id INT PRIMARY KEY DEFAULT 1,
  min_withdrawal NUMERIC NOT NULL DEFAULT 300,
  tds_percent NUMERIC NOT NULL DEFAULT 5,
  admin_charge NUMERIC NOT NULL DEFAULT 0,
  withdrawal_days INT NOT NULL DEFAULT 7,
  daily_pair_cap INT NOT NULL DEFAULT 20,
  refund_days INT NOT NULL DEFAULT 15,
  monthly_repurchase BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

GRANT SELECT ON public.plan_settings TO anon, authenticated;
GRANT ALL ON public.plan_settings TO service_role;
ALTER TABLE public.plan_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read plan settings" ON public.plan_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update settings" ON public.plan_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert settings" ON public.plan_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.plan_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Add TDS + net amount tracking on withdrawals
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS tds_amount NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.withdrawals ADD COLUMN IF NOT EXISTS net_amount NUMERIC NOT NULL DEFAULT 0;

-- Recreate process_order_approval to enforce daily pair capping (20 pairs/day/user)
CREATE OR REPLACE FUNCTION public.process_order_approval(_order_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  v_allowed_pairs INT;
  v_pair_amount NUMERIC;
  v_cap INT;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = _order_id;
  IF v_order.status <> 'approved' THEN RETURN; END IF;

  SELECT * INTO v_product FROM public.products WHERE id = v_order.product_id;
  SELECT * INTO v_buyer FROM public.profiles WHERE id = v_order.user_id;
  SELECT daily_pair_cap INTO v_cap FROM public.plan_settings WHERE id = 1;
  IF v_cap IS NULL THEN v_cap := 20; END IF;

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

  -- 2) Pair matching walk-up with daily capping
  v_current := v_buyer.id;
  LOOP
    SELECT parent_id, position INTO v_parent, v_side FROM public.profiles WHERE id = v_current;
    EXIT WHEN v_parent IS NULL OR v_side IS NULL;

    IF v_side = 'left' THEN
      UPDATE public.tree_stats SET left_count = left_count + 1, updated_at = now() WHERE user_id = v_parent;
    ELSE
      UPDATE public.tree_stats SET right_count = right_count + 1, updated_at = now() WHERE user_id = v_parent;
    END IF;

    -- reset pairs_today if the day changed
    UPDATE public.tree_stats
      SET pairs_today = 0, pairs_day = CURRENT_DATE
      WHERE user_id = v_parent AND pairs_day <> CURRENT_DATE;

    SELECT * INTO v_stats FROM public.tree_stats WHERE user_id = v_parent;
    v_new_pairs := LEAST(v_stats.left_count, v_stats.right_count) - v_stats.matched_pairs;
    v_allowed_pairs := GREATEST(0, LEAST(v_new_pairs, v_cap - v_stats.pairs_today));

    IF v_allowed_pairs > 0 AND v_product.pair_bonus > 0 THEN
      v_pair_amount := v_allowed_pairs * v_product.pair_bonus;
      UPDATE public.tree_stats
        SET matched_pairs = matched_pairs + v_allowed_pairs,
            pairs_today   = pairs_today + v_allowed_pairs
        WHERE user_id = v_parent;
      INSERT INTO public.commissions (user_id, from_user_id, order_id, type, amount, note)
      VALUES (v_parent, v_buyer.id, _order_id, 'pair', v_pair_amount,
              v_allowed_pairs || ' pair(s) matched (daily cap ' || v_cap || ')');
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
$function$;
