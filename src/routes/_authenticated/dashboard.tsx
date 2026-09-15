import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard, Users, Wallet, TrendingUp, Copy, LogOut, IndianRupee,
  GitBranch, ShoppingBag, Send, Clock, Gift, IdCard, Trash2, Network, User,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyDirectTeam, getMyTree, claimMyReward, expireMyRewards, type TreeNode } from "@/lib/mlm.functions";
import { useServerFn } from "@tanstack/react-start";
const logoAsset = { url: "/logo.png" };
const capsuleAsset = { url: "/aaurva-capsule.png" };

type Profile = {
  id: string; full_name: string; email: string; phone: string;
  username: string | null; member_code: string; dob: string | null; photo_url: string | null;
  address_line: string | null; city: string | null; state: string | null; pincode: string | null;
  referral_code: string; sponsor_id: string | null; position: string | null;
  upi_id: string; kyc_status: string; is_active: boolean;
};
type WalletRow = { balance: number; total_earned: number; direct_income: number; pair_income: number };
type TreeStats = { left_count: number; right_count: number; matched_pairs: number };
type Product = { id: string; name: string; description: string; mrp: number; image_url: string; category: string };
type Order = { id: string; product_id: string; amount: number; status: string; created_at: string; upi_reference: string; payment_screenshot_url: string | null; quantity: number };
type PlanSettings = {
  min_withdrawal: number;
  tds_percent: number;
  admin_charge: number;
  withdrawal_days: number;
  daily_pair_cap: number;
  upi_id: string;
  payment_account_name: string;
  qr_image_url: string;
};
type Commission = { id: string; type: string; amount: number; note: string; created_at: string };
type Withdrawal = { id: string; amount: number; upi_id: string; status: string; created_at: string };
type TeamMember = { id: string; full_name: string; referral_code: string; member_position: string | null; created_at: string; is_active: boolean };
type RewardLevel = { level: number; pairs_required: number; amount: number };
type UserReward = { level: number; amount: number; created_at: string; status: string; claim_deadline: string | null };
type CartLine = { product: Product; qty: number };

function withTimeout<T>(promise: Promise<T>, milliseconds = 8000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new Error("Request timed out")), milliseconds);
    }),
  ]);
}


export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Member Dashboard — Righvedh Sanjivni" },
      { name: "description", content: "Manage Righvedh Sanjivni orders, team, income, withdrawals, and profile." },
      { property: "og:title", content: "Member Dashboard — Righvedh Sanjivni" },
      { property: "og:description", content: "Righvedh Sanjivni member account dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const nav = useNavigate();
  const fetchDirectTeam = useServerFn(getMyDirectTeam);
  const fetchTree = useServerFn(getMyTree);
  const claimReward = useServerFn(claimMyReward);
  const expireRewards = useServerFn(expireMyRewards);
  const [tab, setTab] = useState<"overview" | "shop" | "orders" | "team" | "tree" | "rewards" | "income" | "withdraw" | "idcard" | "profile">(() => {
    if (typeof window === "undefined") return "overview";
    return new URLSearchParams(window.location.search).get("tab") === "shop" ? "shop" : "overview";
  });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<WalletRow | null>(null);
  const [stats, setStats] = useState<TreeStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [rewardLevels, setRewardLevels] = useState<RewardLevel[]>([]);
  const [myRewards, setMyRewards] = useState<UserReward[]>([]);
  const [settings, setSettings] = useState<PlanSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  async function loadAll() {
    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) {
        await nav({ to: "/login", replace: true });
        return;
      }

      const uid = userRes.user.id;
      const [p, w, s, pr, o, c, wd, ps, rl, ur] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
        supabase.from("wallets").select("*").eq("user_id", uid).maybeSingle(),
        supabase.from("tree_stats").select("*").eq("user_id", uid).maybeSingle(),
        supabase.from("products").select("*").eq("status", "active").order("created_at"),
        supabase.from("orders").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
        supabase.from("commissions").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(50),
        supabase.from("withdrawals").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
        supabase.from("plan_settings").select("*").eq("id", 1).maybeSingle(),
        supabase.from("reward_levels").select("*").order("level"),
        supabase.from("user_rewards").select("level,amount,created_at,status,claim_deadline").eq("user_id", uid),
      ]);
      if (p.data) setProfile(p.data as Profile);
      if (w.data) setWallet(w.data as WalletRow);
      if (s.data) setStats(s.data as TreeStats);
      setProducts((pr.data || []) as Product[]);
      setOrders((o.data || []) as Order[]);
      setCommissions((c.data || []) as Commission[]);
      setWithdrawals((wd.data || []) as Withdrawal[]);
      setRewardLevels((rl.data || []) as RewardLevel[]);
      setMyRewards((ur.data || []) as UserReward[]);
      if (ps.data) setSettings(ps.data as PlanSettings);

      void Promise.allSettled([
        withTimeout(fetchDirectTeam()).then((rows) => setTeam((rows || []) as TeamMember[])),
        withTimeout(fetchTree()).then((row) => setTree((row as TreeNode | null) ?? null)),
        withTimeout(expireRewards({})),
      ]);
    } catch {
      setNotice("Some dashboard details could not be loaded. Please refresh once.");
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => { loadAll(); }, []);

  async function logout() {
    await supabase.auth.signOut();
    await nav({ to: "/login", replace: true });
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading your dashboard...</div>;
  }
  if (!profile || !wallet) {
    return <div className="min-h-screen flex items-center justify-center text-destructive">Could not load profile. Please try again.</div>;
  }

  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/register?ref=${profile.referral_code}&pos=${profile.position || "left"}`
    : "";

  return (
    <div className="min-h-screen flex bg-gradient-leaf">
      <aside className="w-64 bg-primary text-primary-foreground min-h-screen sticky top-0 hidden md:flex flex-col">
        <div className="px-6 py-5 border-b border-primary-foreground/10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-white ring-2 ring-gold/50 flex items-center justify-center">
            <img src={logoAsset.url} alt="Logo" className="h-full w-full object-cover" />
          </div>
          <div className="leading-tight">
            <div className="font-serif font-bold">Righvedh</div>
            <div className="text-[10px] uppercase tracking-widest text-gold">Member</div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavBtn active={tab === "overview"} onClick={() => setTab("overview")} icon={LayoutDashboard} label="Overview" />
          <NavBtn active={tab === "shop"} onClick={() => setTab("shop")} icon={ShoppingBag} label="Shop / Cart" />
          <NavBtn active={tab === "orders"} onClick={() => setTab("orders")} icon={Clock} label="My Orders" />
          <NavBtn active={tab === "team"} onClick={() => setTab("team")} icon={Users} label="My Team" />
          <NavBtn active={tab === "tree"} onClick={() => setTab("tree")} icon={Network} label="Tree View" />
          <NavBtn active={tab === "rewards"} onClick={() => setTab("rewards")} icon={Gift} label="Reward Levels" />
          <NavBtn active={tab === "income"} onClick={() => setTab("income")} icon={TrendingUp} label="Income History" />
          <NavBtn active={tab === "withdraw"} onClick={() => setTab("withdraw")} icon={Send} label="Withdraw" />
          <NavBtn active={tab === "idcard"} onClick={() => setTab("idcard")} icon={IdCard} label="ID Card" />
          <NavBtn active={tab === "profile"} onClick={() => setTab("profile")} icon={User} label="Profile & KYC" />
        </nav>
        <button onClick={logout} className="m-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-sm">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-full overflow-x-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="font-serif text-3xl text-primary">Welcome, {profile.full_name || "Member"}</h1>
              <p className="text-sm text-muted-foreground">
                User ID: <span className="font-mono font-bold text-primary">{profile.member_code}</span>
                <span className="mx-2">·</span>
                Login mobile: <span className="font-mono font-bold text-primary">{profile.username || profile.phone || "—"}</span>
                <span className="mx-2">·</span>
                Referral code: <span className="font-mono font-bold text-primary">{profile.referral_code}</span>
              </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-primary hover:underline">← Back to website</Link>
            <button onClick={logout} className="md:hidden inline-flex items-center gap-1 rounded-full border border-primary px-3 py-1.5 text-xs text-primary">
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>

        <div className="md:hidden mb-4 grid grid-cols-4 gap-1 text-[11px]">
          {(["overview","shop","orders","team","tree","rewards","income","withdraw","idcard","profile"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`py-2 rounded-lg ${tab===t?"bg-primary text-primary-foreground":"bg-card"}`}>{t}</button>
          ))}
        </div>


        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat icon={Wallet} label="Wallet Balance" value={`₹${wallet.balance}`} accent="gold" />
              <Stat icon={TrendingUp} label="Total Earned" value={`₹${wallet.total_earned}`} />
              <Stat icon={IndianRupee} label="Direct Income" value={`₹${wallet.direct_income}`} />
              <Stat icon={IndianRupee} label="Pair Income" value={`₹${wallet.pair_income}`} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Stat icon={Users} label="Left Team" value={String(stats?.left_count ?? 0)} />
              <Stat icon={Users} label="Right Team" value={String(stats?.right_count ?? 0)} />
              <Stat icon={GitBranch} label="Matched Pairs" value={String(stats?.matched_pairs ?? 0)} />
            </div>
            <div className="rounded-2xl bg-card border border-border p-6 shadow-soft">
              <h3 className="font-serif text-xl text-primary mb-2">Your Referral Link</h3>
              <p className="text-sm text-muted-foreground mb-3">Share this link to add members to your <b>{profile.position || "left"}</b> leg.</p>
              <div className="flex gap-2 items-center">
                <input readOnly value={referralLink} className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-xs font-mono" />
                <button
                  onClick={() => { navigator.clipboard.writeText(referralLink); setNotice("Referral link copied."); }}
                  className="rounded-lg bg-gradient-gold px-4 py-2 text-sm text-gold-foreground font-semibold flex items-center gap-1"
                ><Copy className="h-4 w-4" /> Copy</button>
              </div>
            </div>
          </div>
        )}

        {tab === "shop" && (
          <ShopTab products={products} profile={profile} settings={settings} onDone={loadAll} />
        )}

        {tab === "orders" && (
          <Section title="My Orders">
            <SimpleTable
              cols={["Date", "Product", "Amount", "UPI Ref", "Screenshot", "Status"]}
              rows={orders.map(o => [
                new Date(o.created_at).toLocaleDateString(),
                products.find(p => p.id === o.product_id)?.name || "—",
                `₹${o.amount}`,
                o.upi_reference || "—",
                o.payment_screenshot_url
                  ? <a key="ss" href={o.payment_screenshot_url} target="_blank" rel="noreferrer" className="text-primary underline text-xs">View</a>
                  : <span key="ss" className="text-xs text-muted-foreground">—</span>,
                <StatusPill key="s" status={o.status} />,
              ])}
              empty="No orders yet. Buy a product from the Shop tab to place your first order."
            />
          </Section>
        )}

        {tab === "team" && (
          <Section title="My Direct Team">
            <SimpleTable
              cols={["Name", "Referral Code", "Position", "Status", "Joined"]}
              rows={team.map(t => [
                t.full_name || "—",
                t.referral_code,
                 t.member_position || "—",
                t.is_active ? "Active" : "Pending",
                new Date(t.created_at).toLocaleDateString(),
              ])}
              empty="No direct referrals yet. Share your referral link to grow your team!"
            />
          </Section>
        )}

        {tab === "tree" && (
          <Section title="Binary Tree View">
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <Stat icon={Users} label="Left Leg Members" value={String(countLeg(tree?.left ?? null))} />
              <Stat icon={Users} label="Right Leg Members" value={String(countLeg(tree?.right ?? null))} />
              <Stat icon={GitBranch} label="Matched Pairs (paid)" value={String(stats?.matched_pairs ?? 0)} />
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Every member has two positions — Left and Right. New joinings under your referral fill these
              positions top to bottom. One left member + one right member makes a pair, and each matched pair
              pays your pair bonus. Tree shows up to 10 levels deep.
            </p>
            <div className="overflow-x-auto pb-4">
              {tree ? <TreeBranch node={tree} root /> : <p className="text-sm text-muted-foreground">Tree is not available yet.</p>}
            </div>
          </Section>
        )}


        {tab === "rewards" && (
          <RewardsTab
            levels={rewardLevels}
            earned={myRewards}
            pairs={stats?.matched_pairs ?? 0}
            onClaim={async (level) => {
              try { await claimReward({ data: { level } }); await loadAll(); }
              catch (claimError) { setNotice(claimError instanceof Error ? claimError.message : "Could not claim reward"); }
            }}
          />
        )}

        {tab === "income" && (
          <Section title="Commission History">
            <SimpleTable
              cols={["Date", "Type", "Amount", "Note"]}
              rows={commissions.map(c => [
                new Date(c.created_at).toLocaleDateString(),
                c.type === "direct" ? "Direct Sale" : c.type === "reward" ? "Level Reward" : "Pair Match",
                `₹${c.amount}`,
                c.note,
              ])}
              empty="No commissions yet."
            />
          </Section>
        )}

        {tab === "withdraw" && (
          <WithdrawTab wallet={wallet} profile={profile} withdrawals={withdrawals} settings={settings} onDone={loadAll} />
        )}

        {tab === "idcard" && (
          <IdCardTab profile={profile} onDone={loadAll} />
        )}

        {tab === "profile" && (
          <ProfileTab profile={profile} onDone={loadAll} />
        )}

      </main>
      {notice && (
        <div className="fixed bottom-6 right-6 z-[70] rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm shadow-elegant flex items-center gap-3">
          {notice}
          <button onClick={() => setNotice("")} className="opacity-70 hover:opacity-100">✕</button>
        </div>
      )}
    </div>
  );
}

function NavBtn({ active, onClick, icon: Icon, label }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm ${active ? "bg-gold text-gold-foreground font-semibold" : "hover:bg-primary-foreground/10"}`}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function Stat({ icon: Icon, label, value, accent }: any) {
  return (
    <div className={`rounded-2xl border p-5 shadow-soft ${accent === "gold" ? "bg-gradient-gold text-gold-foreground border-gold/40" : "bg-card border-border"}`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-80"><Icon className="h-4 w-4" /> {label}</div>
      <div className="mt-2 font-serif text-2xl font-bold">{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-soft">
      <h2 className="font-serif text-2xl text-primary mb-4">{title}</h2>
      {children}
    </div>
  );
}

function SimpleTable({ cols, rows, empty }: { cols: string[]; rows: React.ReactNode[][]; empty: string }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground py-6 text-center">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border">
            {cols.map(c => <th key={c} className="py-2 px-2">{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border/50">
              {r.map((cell, j) => <td key={j} className="py-2 px-2">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[status] || "bg-muted"}`}>{status}</span>;
}

function ShopTab({ products, profile, settings, onDone }: { products: Product[]; profile: Profile; settings: PlanSettings | null; onDone: () => void }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [checkout, setCheckout] = useState(false);
  const [upiRef, setUpiRef] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [ship, setShip] = useState({
    name: profile.full_name || "",
    phone: profile.username || profile.phone || "",
    address: profile.address_line || "",
    city: profile.city || "",
    state: profile.state || "",
    pincode: profile.pincode || "",
  });

  const total = cart.reduce((s, l) => s + Number(l.product.mrp) * l.qty, 0);

  function add(p: Product) {
    setCart(c => c.some(l => l.product.id === p.id)
      ? c.map(l => l.product.id === p.id ? { ...l, qty: l.qty + 1 } : l)
      : [...c, { product: p, qty: 1 }]);
    setMsg("");
  }
  function setQty(id: string, qty: number) {
    setCart(c => qty <= 0 ? c.filter(l => l.product.id !== id) : c.map(l => l.product.id === id ? { ...l, qty } : l));
  }

  async function place() {
    if (cart.length === 0) { setMsg("Your cart is empty."); return; }
    if (!file) { setMsg("Please upload your payment screenshot."); return; }
    if (!ship.name.trim() || !ship.phone.trim() || !ship.address.trim() || !ship.city.trim() || !ship.state.trim() || !/^\d{6}$/.test(ship.pincode.trim())) {
      setMsg("Please fill the complete delivery address with a valid 6-digit pincode."); return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${profile.id}/${Date.now()}.${ext}`;
      const up = await supabase.storage.from("payment-proofs").upload(path, file, { upsert: false });
      if (up.error) throw up.error;
      const signed = await supabase.storage.from("payment-proofs").createSignedUrl(path, 60 * 60 * 24 * 365);
      const url = signed.data?.signedUrl || "";
      const cartGroup = (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`) as string;
      const rows = cart.map(l => ({
        user_id: profile.id,
        product_id: l.product.id,
        quantity: l.qty,
        amount: Number(l.product.mrp) * l.qty,
        status: "pending",
        upi_reference: upiRef.trim(),
        payment_screenshot_url: url,
        cart_group: cartGroup,
        ship_name: ship.name.trim(),
        ship_phone: ship.phone.trim(),
        ship_address: ship.address.trim(),
        ship_city: ship.city.trim(),
        ship_state: ship.state.trim(),
        ship_pincode: ship.pincode.trim(),
      }));
      const { error } = await supabase.from("orders").insert(rows);
      if (error) throw error;
      setMsg("Order submitted! Admin will verify your payment screenshot and approve or reject it.");
      setCart([]); setCheckout(false); setUpiRef(""); setFile(null);
      onDone();
    } catch (e: any) {
      setMsg("Error: " + (e.message || String(e)));
    } finally { setBusy(false); }
  }

  return (
    <div className="space-y-6">
      {msg && <div className="rounded-lg bg-primary/10 text-primary text-sm p-4">{msg}</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(p => (
          <div key={p.id} className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden flex flex-col h-full">
            <img
              src={p.image_url || capsuleAsset.url}
              alt={p.name}
              className="w-full h-40 object-cover bg-gradient-to-br from-primary/10 to-gold/20"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = capsuleAsset.url; }}
            />
            <div className="p-5 flex flex-col flex-1">
              <div className="text-xs uppercase tracking-wider text-gold font-semibold">{p.category}</div>
              <h3 className="font-serif text-lg text-primary mt-1 min-h-[3.5rem]">{p.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
              <div className="mt-auto pt-4 flex items-center justify-between">
                <div className="font-bold text-primary">₹{p.mrp}</div>
                <button onClick={() => add(p)} className="rounded-full bg-gradient-gold px-4 py-2 text-xs font-semibold text-gold-foreground">Add to Cart</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Section title={`My Cart (${cart.length} item${cart.length === 1 ? "" : "s"})`}>
        {cart.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Cart is empty. Add one or more products, then pay once for the whole cart.</p>
        ) : (
          <div className="space-y-3">
            {cart.map(l => (
              <div key={l.product.id} className="flex items-center gap-3 border-b border-border/60 pb-3">
                <div className="flex-1">
                  <div className="font-semibold text-primary text-sm">{l.product.name}</div>
                  <div className="text-xs text-muted-foreground">₹{l.product.mrp} each</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQty(l.product.id, l.qty - 1)} className="h-7 w-7 rounded-full border border-input">−</button>
                  <span className="w-6 text-center text-sm">{l.qty}</span>
                  <button onClick={() => setQty(l.product.id, l.qty + 1)} className="h-7 w-7 rounded-full border border-input">+</button>
                </div>
                <div className="w-20 text-right font-bold text-primary text-sm">₹{Number(l.product.mrp) * l.qty}</div>
                <button onClick={() => setQty(l.product.id, 0)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2">
              <div className="font-serif text-xl text-primary">Total: ₹{total}</div>
              <button onClick={() => { setCheckout(true); setMsg(""); }} className="rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-semibold text-gold-foreground shadow-gold">
                Checkout & Pay
              </button>
            </div>
          </div>
        )}
      </Section>

      {checkout && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-6 overflow-y-auto" onClick={() => setCheckout(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-2xl p-8 max-w-lg w-full shadow-elegant my-8">
            <h3 className="font-serif text-2xl text-primary">Checkout</h3>
            <p className="text-sm text-muted-foreground mt-1">{cart.length} item(s) · Total ₹{total}</p>

            <h4 className="mt-5 font-semibold text-sm text-primary">Delivery Address</h4>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <input value={ship.name} onChange={e => setShip({ ...ship, name: e.target.value })} placeholder="Full name" className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm" />
              <input value={ship.phone} onChange={e => setShip({ ...ship, phone: e.target.value })} placeholder="Mobile number" className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm" />
              <input value={ship.address} onChange={e => setShip({ ...ship, address: e.target.value })} placeholder="House / Street / Area" className="sm:col-span-2 rounded-xl border border-input bg-background px-3 py-2.5 text-sm" />
              <input value={ship.city} onChange={e => setShip({ ...ship, city: e.target.value })} placeholder="City" className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm" />
              <input value={ship.state} onChange={e => setShip({ ...ship, state: e.target.value })} placeholder="State" className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm" />
              <input value={ship.pincode} onChange={e => setShip({ ...ship, pincode: e.target.value })} placeholder="Pincode" className="rounded-xl border border-input bg-background px-3 py-2.5 text-sm" />
            </div>

            <div className="mt-6 rounded-xl bg-cream p-4 text-center">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Pay ₹{total} via UPI</div>
              <img
                src={settings?.qr_image_url || "/phonepe-qr.png"}
                onError={(event) => { event.currentTarget.src = "/phonepe-qr.png"; }}
                alt="Payment QR code"
                className="mx-auto mt-3 w-44 rounded-xl border border-border bg-white p-2"
              />
              <div className="mt-3 font-mono text-lg font-bold text-primary select-all">{settings?.upi_id || "kartiktirgar@ybl"}</div>
              <div className="text-xs text-muted-foreground">{settings?.payment_account_name || "KARTIK TIRGAR"}</div>
            </div>

            <label className="block mt-4 text-sm font-medium">
              Payment Screenshot <span className="text-destructive">*</span>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} required className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:px-3 file:py-1.5" />
              {file && <div className="mt-1 text-xs text-muted-foreground">Selected: {file.name}</div>}
            </label>
            <label className="block mt-4 text-sm font-medium">
              UPI Reference / UTR Number <span className="text-muted-foreground text-xs">(optional)</span>
              <input value={upiRef} onChange={(e) => setUpiRef(e.target.value)} placeholder="12 digit UTR" className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
            </label>
            {msg && <div className="mt-3 rounded-lg bg-destructive/10 text-destructive text-sm p-3">{msg}</div>}
            <div className="mt-6 flex gap-3">
              <button onClick={() => setCheckout(false)} className="flex-1 rounded-full border border-input py-2.5 text-sm">Cancel</button>
              <button disabled={busy || !file} onClick={place} className="flex-1 rounded-full bg-gradient-gold py-2.5 text-sm font-semibold text-gold-foreground disabled:opacity-60">
                {busy ? "Submitting..." : "I have paid, Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WithdrawTab({ wallet, profile, withdrawals, settings, onDone }: { wallet: WalletRow; profile: Profile; withdrawals: Withdrawal[]; settings: PlanSettings | null; onDone: () => void }) {
  const [amount, setAmount] = useState("");
  const [upi, setUpi] = useState(profile.upi_id || "");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const minWd = settings?.min_withdrawal ?? 300;
  const tdsPct = settings?.tds_percent ?? 5;
  const adminChg = settings?.admin_charge ?? 0;
  const days = settings?.withdrawal_days ?? 7;

  const amt = Number(amount) || 0;
  const tds = +(amt * tdsPct / 100).toFixed(2);
  const net = Math.max(0, +(amt - tds - adminChg).toFixed(2));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (amt < minWd) { setMsg(`Minimum withdrawal is ₹${minWd}`); return; }
    if (amt > wallet.balance) { setMsg("Amount exceeds wallet balance"); return; }
    setBusy(true);
    const { error } = await supabase.from("withdrawals").insert({
      user_id: profile.id, amount: amt, upi_id: upi.trim(),
      tds_amount: tds, net_amount: net,
    });
    setBusy(false);
    if (error) { setMsg("Error: " + error.message); return; }
    setMsg(`Withdrawal request submitted. You will receive ₹${net} in your UPI within ${days} days after admin approval.`);
    setAmount(""); onDone();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-gold text-gold-foreground p-6 shadow-gold">
        <div className="text-xs uppercase tracking-widest">Available Balance</div>
        <div className="font-serif text-4xl font-bold mt-1">₹{wallet.balance}</div>
      </div>

      <div className="rounded-2xl bg-card border border-border p-5 shadow-soft grid gap-3 sm:grid-cols-4 text-center text-sm">
        <div><div className="text-xs text-muted-foreground uppercase">Minimum</div><div className="font-serif text-primary text-lg font-bold">₹{minWd}</div></div>
        <div><div className="text-xs text-muted-foreground uppercase">TDS</div><div className="font-serif text-primary text-lg font-bold">{tdsPct}%</div></div>
        <div><div className="text-xs text-muted-foreground uppercase">Admin Charge</div><div className="font-serif text-primary text-lg font-bold">₹{adminChg}</div></div>
        <div><div className="text-xs text-muted-foreground uppercase">Payout Time</div><div className="font-serif text-primary text-lg font-bold">{days} days</div></div>
      </div>

      <Section title="Request Withdrawal">
        {msg && <div className="rounded-lg bg-primary/10 text-primary text-sm p-3 mb-4">{msg}</div>}
        <form onSubmit={submit} className="space-y-4 max-w-md">
          <label className="block text-sm font-medium">
            Amount (₹) <span className="text-xs text-muted-foreground">— min ₹{minWd}</span>
            <input type="number" min={minWd} value={amount} onChange={(e) => setAmount(e.target.value)} required className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
          </label>
          <label className="block text-sm font-medium">
            Your UPI ID
            <input value={upi} onChange={(e) => setUpi(e.target.value)} required placeholder="yourname@ybl" className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
          </label>

          {amt > 0 && (
            <div className="rounded-lg bg-cream p-4 text-sm space-y-1">
              <div className="flex justify-between"><span>Requested</span><b>₹{amt}</b></div>
              <div className="flex justify-between text-muted-foreground"><span>TDS ({tdsPct}%)</span><span>− ₹{tds}</span></div>
              {adminChg > 0 && <div className="flex justify-between text-muted-foreground"><span>Admin charge</span><span>− ₹{adminChg}</span></div>}
              <div className="flex justify-between border-t border-border pt-1 mt-1 text-primary font-bold"><span>You will receive</span><span>₹{net}</span></div>
            </div>
          )}

          <button disabled={busy} className="rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm font-semibold disabled:opacity-60">
            {busy ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </Section>
      <Section title="Withdrawal History">
        <SimpleTable
          cols={["Date", "Amount", "TDS", "Net Paid", "UPI", "Status"]}
          rows={withdrawals.map(w => [
            new Date(w.created_at).toLocaleDateString(),
            `₹${w.amount}`,
            `₹${(w as any).tds_amount ?? 0}`,
            `₹${(w as any).net_amount ?? w.amount}`,
            w.upi_id,
            <StatusPill key="s" status={w.status} />,
          ])}
          empty="No withdrawal requests yet."
        />
      </Section>
    </div>
  );
}

function ProfileTab({ profile, onDone }: { profile: Profile; onDone: () => void }) {
  const [f, setF] = useState({
    full_name: profile.full_name,
    phone: profile.phone,
    upi_id: profile.upi_id,
    address_line: profile.address_line || "",
    city: profile.city || "",
    state: profile.state || "",
    pincode: profile.pincode || "",
  });
  const [msg, setMsg] = useState("");
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from("profiles").update(f).eq("id", profile.id);
    if (error) setMsg("Error: " + error.message);
    else { setMsg("Profile updated."); onDone(); }
  }
  return (
    <Section title="My Profile">
      {msg && <div className="rounded-lg bg-primary/10 text-primary text-sm p-3 mb-4">{msg}</div>}
      <div className="mb-6 grid gap-3 sm:grid-cols-3 text-sm">
        <div className="rounded-xl bg-cream p-4"><div className="text-xs uppercase text-muted-foreground">User ID</div><div className="font-mono font-bold text-primary">{profile.member_code}</div></div>
        <div className="rounded-xl bg-cream p-4"><div className="text-xs uppercase text-muted-foreground">Date of Birth</div><div className="font-bold text-primary">{profile.dob || "—"}</div></div>
        <div className="rounded-xl bg-cream p-4"><div className="text-xs uppercase text-muted-foreground">Referral Code</div><div className="font-mono font-bold text-primary">{profile.referral_code}</div></div>
      </div>
      <form onSubmit={save} className="space-y-4 max-w-md">
        <label className="block text-sm font-medium">Login Mobile Number
          <input disabled value={profile.username || profile.phone || ""} className="mt-1 w-full rounded-xl border border-input bg-muted px-4 py-3 text-sm font-mono" />
        </label>
        <label className="block text-sm font-medium">Email
          <input disabled value={profile.email} className="mt-1 w-full rounded-xl border border-input bg-muted px-4 py-3 text-sm" />
        </label>
        <label className="block text-sm font-medium">Full Name
          <input value={f.full_name} onChange={e => setF({ ...f, full_name: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
        </label>
        <label className="block text-sm font-medium">Phone
          <input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
        </label>
        <label className="block text-sm font-medium">Address
          <input value={f.address_line} onChange={e => setF({ ...f, address_line: e.target.value })} placeholder="House / Street / Area" className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className="block text-sm font-medium">City
            <input value={f.city} onChange={e => setF({ ...f, city: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm" />
          </label>
          <label className="block text-sm font-medium">State
            <input value={f.state} onChange={e => setF({ ...f, state: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm" />
          </label>
          <label className="block text-sm font-medium">Pincode
            <input value={f.pincode} onChange={e => setF({ ...f, pincode: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-3 text-sm" />
          </label>
        </div>
        <label className="block text-sm font-medium">UPI ID (for withdrawals)
          <input value={f.upi_id} onChange={e => setF({ ...f, upi_id: e.target.value })} placeholder="yourname@ybl" className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
        </label>
        <div className="text-sm">KYC Status: <b className={profile.kyc_status === "approved" ? "text-green-600" : "text-amber-600"}>{profile.kyc_status}</b></div>
        <button className="rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm font-semibold">Save</button>
      </form>
    </Section>
  );
}

function countLeg(node: TreeNode | null): number {
  if (!node) return 0;
  return 1 + countLeg(node.left) + countLeg(node.right);
}

function NodeCard({ node, root }: { node: TreeNode | null; root?: boolean }) {
  if (!node) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-4 py-4 min-w-[150px] text-center">
        <div className="mx-auto h-9 w-9 rounded-full border border-dashed border-border" />
        <div className="mt-2 text-xs text-muted-foreground">Empty position</div>
      </div>
    );
  }
  const initials = (node.full_name || "M").trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (
    <div className={`rounded-2xl border px-4 py-3 min-w-[150px] text-center shadow-soft ${root
      ? "bg-gradient-gold text-gold-foreground border-gold/50"
      : node.is_active ? "bg-card border-primary/40" : "bg-card border-border"}`}>
      <div className={`mx-auto h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold ${root ? "bg-gold-foreground/15" : node.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
        {initials}
      </div>
      <div className="mt-2 text-sm font-semibold truncate max-w-[150px] mx-auto">{node.full_name || "Member"}</div>
      <div className="font-mono text-[11px] opacity-80">{node.member_code}</div>
      <div className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${root ? "bg-gold-foreground/15" : node.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
        {root ? "You" : node.is_active ? "Active" : "Pending"}
      </div>
    </div>
  );
}

function TreeBranch({ node, root, depth = 0 }: { node: TreeNode; root?: boolean; depth?: number }) {
  // Show empty slots for the first few levels so the binary structure is visible.
  const showSlots = depth < 2 || !!(node.left || node.right);
  const expand = depth < 10 && showSlots;
  return (
    <div className="flex flex-col items-center">
      <NodeCard node={node} root={root} />
      {expand && (
        <>
          <div className="h-6 w-px bg-border" />
          <div className="flex">
            <TreeLeg label="Left" child={node.left} depth={depth} side="left" />
            <TreeLeg label="Right" child={node.right} depth={depth} side="right" />
          </div>
        </>
      )}
    </div>
  );
}

function TreeLeg({ label, child, depth, side }: { label: string; child: TreeNode | null; depth: number; side: "left" | "right" }) {
  return (
    <div className="flex flex-col items-center px-3 sm:px-5">
      {/* horizontal connector: half-width line towards the parent stem */}
      <div className="flex w-full h-4">
        <div className={`flex-1 ${side === "right" ? "border-t border-border" : ""}`} />
        <div className={`flex-1 ${side === "left" ? "border-t border-border" : ""}`} />
      </div>
      <div className="h-4 w-px bg-border" />
      <div className={`mb-2 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${side === "left" ? "bg-primary/10 text-primary" : "bg-gold/15 text-gold"}`}>{label}</div>
      {child
        ? <TreeBranch node={child} depth={depth + 1} />
        : <NodeCard node={null} />}
    </div>
  );
}


function RewardsTab({ levels, earned, pairs, onClaim }: { levels: RewardLevel[]; earned: UserReward[]; pairs: number; onClaim: (level: number) => Promise<void> }) {
  const byLevel = new Map(earned.map(e => [e.level, e]));
  const claimed = earned.filter(e => e.status === "claimed");
  const available = earned.filter(e => e.status === "available");
  const total = claimed.reduce((s, e) => s + Number(e.amount), 0);
  const [busy, setBusy] = useState<number | null>(null);

  function daysLeft(deadline: string | null) {
    if (!deadline) return 0;
    return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000));
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat icon={GitBranch} label="Matched Pairs" value={String(pairs)} />
        <Stat icon={Gift} label="Ready to Claim" value={String(available.length)} accent={available.length ? "gold" : undefined} />
        <Stat icon={Gift} label="Rewards Claimed" value={`${claimed.length} / ${levels.length}`} />
        <Stat icon={IndianRupee} label="Reward Income" value={`₹${total.toLocaleString("en-IN")}`} accent="gold" />
      </div>

      {available.length > 0 && (
        <Section title="Rewards Ready to Claim">
          <p className="text-sm text-muted-foreground mb-4">Claim within 7 days of achieving the target. After 7 days the reward expires and cannot be claimed.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {available.map(r => (
              <div key={r.level} className="rounded-2xl border border-gold/50 bg-gradient-gold text-gold-foreground p-5 shadow-gold">
                <div className="text-xs uppercase tracking-widest">Level {r.level} Star</div>
                <div className="font-serif text-2xl font-bold mt-1">₹{Number(r.amount).toLocaleString("en-IN")}</div>
                <div className="text-xs mt-1 opacity-90 flex items-center gap-1"><Clock className="h-3 w-3" /> {daysLeft(r.claim_deadline)} day(s) left to claim</div>
                <button
                  disabled={busy === r.level}
                  onClick={async () => { setBusy(r.level); await onClaim(r.level); setBusy(null); }}
                  className="mt-3 w-full rounded-full bg-primary text-primary-foreground py-2 text-sm font-semibold disabled:opacity-60"
                >
                  {busy === r.level ? "Claiming…" : "Claim Reward"}
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Reward Levels">
        <p className="text-sm text-muted-foreground mb-4">Achieve the required pairs to unlock each star. Unlocked rewards must be claimed within 7 days; claimed amounts go straight to your wallet balance. Scroll sideways to see all levels.</p>
        <div className="overflow-x-auto pb-3">
          <div className="flex gap-3 min-w-max">
            {levels.map(l => {
              const row = byLevel.get(l.level);
              const status = row?.status;
              const progress = Math.min(100, Math.round((pairs / l.pairs_required) * 100));
              const done = status === "claimed";
              return (
                <div key={l.level} className={`w-44 shrink-0 rounded-2xl border p-4 ${done ? "bg-gradient-gold text-gold-foreground border-gold/50 shadow-gold" : status === "available" ? "bg-card border-gold" : "bg-card border-border"}`}>
                  <div className="text-xs uppercase tracking-widest">Level {l.level} ★</div>
                  <div className="font-serif text-xl font-bold mt-1">₹{Number(l.amount).toLocaleString("en-IN")}</div>
                  <div className="text-xs mt-1 opacity-80">{l.pairs_required.toLocaleString("en-IN")} pairs</div>
                  <div className="mt-3 h-1.5 rounded-full bg-black/10 overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="mt-2 text-[11px] font-semibold">
                    {done ? "Claimed ✓" : status === "available" ? "Ready to claim" : status === "expired" ? "Expired" : `${progress}%`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>
    </div>
  );
}

function IdCardTab({ profile, onDone }: { profile: Profile; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  async function uploadPhoto(file: File) {
    setBusy(true); setMsg("");
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${profile.id}/photo-${Date.now()}.${ext}`;
      const up = await supabase.storage.from("member-photos").upload(path, file, { upsert: true });
      if (up.error) throw up.error;
      const { data } = supabase.storage.from("member-photos").getPublicUrl(path);
      const { error } = await supabase.from("profiles").update({ photo_url: data.publicUrl }).eq("id", profile.id);
      if (error) throw error;
      setMsg("Photo updated on your ID card.");
      onDone();
    } catch (e: any) {
      setMsg("Error: " + (e.message || String(e)));
    } finally { setBusy(false); }
  }

  async function download() {
    const canvas = document.createElement("canvas");
    canvas.width = 1012; canvas.height = 638;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#0f2e1d"; ctx.fillRect(0, 0, 1012, 638);
    ctx.fillStyle = "#fdfaf1"; ctx.fillRect(24, 140, 964, 474);
    ctx.fillStyle = "#c9a227"; ctx.fillRect(24, 128, 964, 12);
    ctx.fillStyle = "#fdfaf1";
    ctx.font = "bold 42px Georgia, serif";
    ctx.fillText("RIGHVEDH SANJIVNI", 40, 70);
    ctx.font = "20px Arial";
    ctx.fillStyle = "#c9a227";
    ctx.fillText("MEMBER IDENTITY CARD", 42, 104);

    const loadImg = (src: string) => new Promise<HTMLImageElement | null>(res => {
      const i = new Image(); i.crossOrigin = "anonymous";
      i.onload = () => res(i); i.onerror = () => res(null); i.src = src;
    });
    const photo = profile.photo_url ? await loadImg(profile.photo_url) : null;
    ctx.strokeStyle = "#0f2e1d"; ctx.lineWidth = 4;
    ctx.strokeRect(60, 190, 220, 260);
    if (photo) ctx.drawImage(photo, 60, 190, 220, 260);
    else { ctx.fillStyle = "#e6e1d3"; ctx.fillRect(62, 192, 216, 256); ctx.fillStyle = "#8a8778"; ctx.font = "18px Arial"; ctx.fillText("No Photo", 130, 325); }

    const rows: [string, string][] = [
      ["Name", profile.full_name || "—"],
      ["User ID", profile.member_code],
      ["Mobile", profile.username || profile.phone || "—"],
      ["Date of Birth", profile.dob || "—"],
      ["Referral Code", profile.referral_code],
      ["City", [profile.city, profile.state].filter(Boolean).join(", ") || "—"],
    ];
    let y = 220;
    rows.forEach(([k, v]) => {
      ctx.fillStyle = "#6b6b5f"; ctx.font = "18px Arial"; ctx.fillText(k.toUpperCase(), 330, y);
      ctx.fillStyle = "#0f2e1d"; ctx.font = "bold 26px Arial"; ctx.fillText(v, 330, y + 30);
      y += 70;
    });
    ctx.fillStyle = "#6b6b5f"; ctx.font = "16px Arial";
    ctx.fillText("This card is the property of Righvedh Sanjivni. Valid with active membership.", 60, 590);

    const link = document.createElement("a");
    link.download = `${profile.member_code}-id-card.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div className="space-y-6">
      <Section title="Employee / Member ID Card">
        {msg && <div className="rounded-lg bg-primary/10 text-primary text-sm p-3 mb-4">{msg}</div>}
        <div ref={cardRef} className="max-w-xl rounded-2xl overflow-hidden border border-border shadow-elegant">
          <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-white ring-2 ring-gold/60">
              <img src={logoAsset.url} alt="Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="font-serif text-xl font-bold">RIGHVEDH SANJIVNI</div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-gold">Member Identity Card</div>
            </div>
          </div>
          <div className="bg-cream p-6 flex gap-6">
            <div className="h-36 w-28 shrink-0 rounded-lg border-2 border-primary overflow-hidden bg-white flex items-center justify-center">
              {profile.photo_url
                ? <img src={profile.photo_url} alt="Member" className="h-full w-full object-cover" />
                : <span className="text-[11px] text-muted-foreground text-center px-2">No photo uploaded</span>}
            </div>
            <div className="text-sm space-y-1.5">
              <CardRow k="Name" v={profile.full_name || "—"} />
              <CardRow k="User ID" v={profile.member_code} mono />
              <CardRow k="Mobile" v={profile.username || profile.phone || "—"} mono />
              <CardRow k="Date of Birth" v={profile.dob || "—"} />
              <CardRow k="Referral Code" v={profile.referral_code} mono />
              <CardRow k="City" v={[profile.city, profile.state].filter(Boolean).join(", ") || "—"} />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 items-center">
          <label className="rounded-full border border-input px-5 py-2.5 text-sm cursor-pointer">
            {busy ? "Uploading..." : "Upload Photo"}
            <input type="file" accept="image/*" className="hidden" disabled={busy}
              onChange={(e) => { const fl = e.target.files?.[0]; if (fl) uploadPhoto(fl); }} />
          </label>
          <button onClick={download} className="rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-semibold text-gold-foreground shadow-gold">
            Download ID Card
          </button>
        </div>
      </Section>
    </div>
  );
}

function CardRow({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex gap-2">
      <span className="w-28 text-xs uppercase tracking-wide text-muted-foreground pt-0.5">{k}</span>
      <span className={`font-semibold text-primary ${mono ? "font-mono" : ""}`}>{v}</span>
    </div>
  );
}
