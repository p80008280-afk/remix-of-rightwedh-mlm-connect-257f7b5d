import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, Wallet, TrendingUp, Copy, LogOut, IndianRupee,
  GitBranch, ShoppingBag, Send, CheckCircle2, Clock, XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logoAsset from "@/assets/logo.png.asset.json";

type Profile = {
  id: string; full_name: string; email: string; phone: string;
  referral_code: string; sponsor_id: string | null; position: string | null;
  upi_id: string; kyc_status: string; is_active: boolean;
};
type WalletRow = { balance: number; total_earned: number; direct_income: number; pair_income: number };
type TreeStats = { left_count: number; right_count: number; matched_pairs: number };
type Product = { id: string; name: string; description: string; mrp: number; image_url: string; category: string };
type Order = { id: string; product_id: string; amount: number; status: string; created_at: string; upi_reference: string; payment_screenshot_url: string | null };
type PlanSettings = { min_withdrawal: number; tds_percent: number; admin_charge: number; withdrawal_days: number; daily_pair_cap: number };
type Commission = { id: string; type: string; amount: number; note: string; created_at: string };
type Withdrawal = { id: string; amount: number; upi_id: string; status: string; created_at: string };
type TeamMember = { id: string; full_name: string; referral_code: string; position: string | null; created_at: string; is_active: boolean };

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Member Dashboard — Righwedh Sanjivni" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const nav = useNavigate();
  const [tab, setTab] = useState<"overview" | "shop" | "orders" | "team" | "income" | "withdraw" | "profile">("overview");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<WalletRow | null>(null);
  const [stats, setStats] = useState<TreeStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [settings, setSettings] = useState<PlanSettings | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) return;
    const uid = userRes.user.id;
    const [p, w, s, pr, o, c, wd, tm, ps] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      supabase.from("wallets").select("*").eq("user_id", uid).maybeSingle(),
      supabase.from("tree_stats").select("*").eq("user_id", uid).maybeSingle(),
      supabase.from("products").select("*").eq("status", "active").order("created_at"),
      supabase.from("orders").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      supabase.from("commissions").select("*").eq("user_id", uid).order("created_at", { ascending: false }).limit(50),
      supabase.from("withdrawals").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
      supabase.from("profiles").select("id,full_name,referral_code,position,created_at,is_active").eq("sponsor_id", uid),
      supabase.from("plan_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    if (p.data) setProfile(p.data as Profile);
    if (w.data) setWallet(w.data as WalletRow);
    if (s.data) setStats(s.data as TreeStats);
    setProducts((pr.data || []) as Product[]);
    setOrders((o.data || []) as Order[]);
    setCommissions((c.data || []) as Commission[]);
    setWithdrawals((wd.data || []) as Withdrawal[]);
    setTeam((tm.data || []) as TeamMember[]);
    if (ps.data) setSettings(ps.data as PlanSettings);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  async function logout() {
    await supabase.auth.signOut();
    await nav({ to: "/" });
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
            <div className="font-serif font-bold">Righwedh</div>
            <div className="text-[10px] uppercase tracking-widest text-gold">Member</div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavBtn active={tab === "overview"} onClick={() => setTab("overview")} icon={LayoutDashboard} label="Overview" />
          <NavBtn active={tab === "shop"} onClick={() => setTab("shop")} icon={ShoppingBag} label="Shop / Buy" />
          <NavBtn active={tab === "orders"} onClick={() => setTab("orders")} icon={Clock} label="My Orders" />
          <NavBtn active={tab === "team"} onClick={() => setTab("team")} icon={Users} label="My Team" />
          <NavBtn active={tab === "income"} onClick={() => setTab("income")} icon={TrendingUp} label="Income History" />
          <NavBtn active={tab === "withdraw"} onClick={() => setTab("withdraw")} icon={Send} label="Withdraw" />
          <NavBtn active={tab === "profile"} onClick={() => setTab("profile")} icon={GitBranch} label="Profile & KYC" />
        </nav>
        <button onClick={logout} className="m-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-sm">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-full overflow-x-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="font-serif text-3xl text-primary">Welcome, {profile.full_name || "Member"}</h1>
            <p className="text-sm text-muted-foreground">Referral code: <span className="font-mono font-bold text-primary">{profile.referral_code}</span></p>
          </div>
          <Link to="/" className="text-sm text-primary hover:underline">← Back to website</Link>
        </div>

        <div className="md:hidden mb-4 grid grid-cols-4 gap-1 text-xs">
          {(["overview","shop","orders","team","income","withdraw","profile"] as const).map(t => (
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
                  onClick={() => { navigator.clipboard.writeText(referralLink); alert("Copied!"); }}
                  className="rounded-lg bg-gradient-gold px-4 py-2 text-sm text-gold-foreground font-semibold flex items-center gap-1"
                ><Copy className="h-4 w-4" /> Copy</button>
              </div>
            </div>
          </div>
        )}

        {tab === "shop" && (
          <ShopTab products={products} profile={profile} onDone={loadAll} />
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
              empty="No orders yet. Buy a product from the Shop tab to activate your account."
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
                t.position || "—",
                t.is_active ? "Active" : "Pending",
                new Date(t.created_at).toLocaleDateString(),
              ])}
              empty="No direct referrals yet. Share your referral link to grow your team!"
            />
          </Section>
        )}

        {tab === "income" && (
          <Section title="Commission History">
            <SimpleTable
              cols={["Date", "Type", "Amount", "Note"]}
              rows={commissions.map(c => [
                new Date(c.created_at).toLocaleDateString(),
                c.type === "direct" ? "Direct Sale" : "Pair Match",
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

        {tab === "profile" && (
          <ProfileTab profile={profile} onDone={loadAll} />
        )}
      </main>
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

function ShopTab({ products, profile, onDone }: { products: Product[]; profile: Profile; onDone: () => void }) {
  const [selected, setSelected] = useState<Product | null>(null);
  const [upiRef, setUpiRef] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function place() {
    if (!selected || !file) { setMsg("Please upload your payment screenshot."); return; }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${profile.id}/${Date.now()}.${ext}`;
      const up = await supabase.storage.from("payment-proofs").upload(path, file, { upsert: false });
      if (up.error) throw up.error;
      const signed = await supabase.storage.from("payment-proofs").createSignedUrl(path, 60 * 60 * 24 * 365);
      const url = signed.data?.signedUrl || "";
      const { error } = await supabase.from("orders").insert({
        user_id: profile.id,
        product_id: selected.id,
        amount: selected.mrp,
        status: "pending",
        upi_reference: upiRef.trim(),
        payment_screenshot_url: url,
      });
      if (error) throw error;
      setMsg("Order submitted! Admin will verify your payment and activate your account. Check the 'My Orders' tab.");
      setSelected(null); setUpiRef(""); setFile(null);
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
          <div key={p.id} className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
            {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-40 object-cover" />}
            <div className="p-5">
              <div className="text-xs uppercase tracking-wider text-gold font-semibold">{p.category}</div>
              <h3 className="font-serif text-lg text-primary mt-1">{p.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <div className="font-bold text-primary">₹{p.mrp}</div>
                <button onClick={() => setSelected(p)} className="rounded-full bg-gradient-gold px-4 py-2 text-xs font-semibold text-gold-foreground">Buy Now</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6 overflow-y-auto" onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-2xl p-8 max-w-md w-full shadow-elegant my-8">
            <h3 className="font-serif text-2xl text-primary">Pay ₹{selected.mrp}</h3>
            <p className="text-sm text-muted-foreground mt-1">for {selected.name}</p>
            <div className="mt-6 rounded-xl bg-cream p-4 text-center">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Pay via UPI</div>
              <div className="mt-1 font-mono text-lg font-bold text-primary">kartiktirgar@ybl</div>
              <p className="text-xs text-muted-foreground mt-2">Open PhonePe / Google Pay → Send ₹{selected.mrp} to above UPI ID → upload the payment screenshot below.</p>
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
            <div className="mt-6 flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 rounded-full border border-input py-2.5 text-sm">Cancel</button>
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

function WithdrawTab({ wallet, profile, withdrawals, onDone }: { wallet: WalletRow; profile: Profile; withdrawals: Withdrawal[]; onDone: () => void }) {
  const [amount, setAmount] = useState("");
  const [upi, setUpi] = useState(profile.upi_id || "");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (amt <= 0 || amt > wallet.balance) { setMsg("Invalid amount"); return; }
    setBusy(true);
    const { error } = await supabase.from("withdrawals").insert({
      user_id: profile.id, amount: amt, upi_id: upi.trim(),
    });
    setBusy(false);
    if (error) { setMsg("Error: " + error.message); return; }
    setMsg("Withdrawal request submitted. Admin will process within 48 hours.");
    setAmount(""); onDone();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-gold text-gold-foreground p-6 shadow-gold">
        <div className="text-xs uppercase tracking-widest">Available Balance</div>
        <div className="font-serif text-4xl font-bold mt-1">₹{wallet.balance}</div>
      </div>
      <Section title="Request Withdrawal">
        {msg && <div className="rounded-lg bg-primary/10 text-primary text-sm p-3 mb-4">{msg}</div>}
        <form onSubmit={submit} className="space-y-4 max-w-md">
          <label className="block text-sm font-medium">
            Amount (₹)
            <input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} required className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
          </label>
          <label className="block text-sm font-medium">
            Your UPI ID
            <input value={upi} onChange={(e) => setUpi(e.target.value)} required placeholder="yourname@ybl" className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
          </label>
          <button disabled={busy} className="rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm font-semibold disabled:opacity-60">
            {busy ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </Section>
      <Section title="Withdrawal History">
        <SimpleTable
          cols={["Date", "Amount", "UPI", "Status"]}
          rows={withdrawals.map(w => [
            new Date(w.created_at).toLocaleDateString(),
            `₹${w.amount}`, w.upi_id,
            <StatusPill key="s" status={w.status} />,
          ])}
          empty="No withdrawal requests yet."
        />
      </Section>
    </div>
  );
}

function ProfileTab({ profile, onDone }: { profile: Profile; onDone: () => void }) {
  const [f, setF] = useState({ full_name: profile.full_name, phone: profile.phone, upi_id: profile.upi_id });
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
      <form onSubmit={save} className="space-y-4 max-w-md">
        <label className="block text-sm font-medium">Email
          <input disabled value={profile.email} className="mt-1 w-full rounded-xl border border-input bg-muted px-4 py-3 text-sm" />
        </label>
        <label className="block text-sm font-medium">Full Name
          <input value={f.full_name} onChange={e => setF({ ...f, full_name: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
        </label>
        <label className="block text-sm font-medium">Phone
          <input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
        </label>
        <label className="block text-sm font-medium">UPI ID (for withdrawals)
          <input value={f.upi_id} onChange={e => setF({ ...f, upi_id: e.target.value })} placeholder="yourname@ybl" className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm" />
        </label>
        <div className="text-sm">KYC Status: <b className={profile.kyc_status === "approved" ? "text-green-600" : "text-amber-600"}>{profile.kyc_status}</b></div>
        <button className="rounded-full bg-primary text-primary-foreground px-8 py-3 text-sm font-semibold">Save</button>
      </form>
    </Section>
  );
}
