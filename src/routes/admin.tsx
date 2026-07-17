import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, Package, ShoppingCart, Wallet, GitBranch,
  Settings, Megaphone, FileText, LogOut, ShieldCheck, TrendingUp,
  IndianRupee, UserPlus, CheckCircle2, XCircle,
} from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";

// NOTE: Demo credentials for client preview only. Real auth comes in the next phase.
const ADMIN_EMAIL = "adnanzaidi778@gmail.com";
const ADMIN_PASSWORD = "CNCFiles.in";
const AUTH_KEY = "rs_admin_authed";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Righwedh Sanjivni" },
      { name: "description", content: "Righwedh Sanjivni admin control panel — manage members, products, orders, commissions and withdrawals." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAuthed(window.localStorage.getItem(AUTH_KEY) === "1");
      setChecked(true);
    }
  }, []);

  if (!checked) return null;
  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />;
  return <AdminDashboard onLogout={() => { localStorage.removeItem(AUTH_KEY); setAuthed(false); }} />;
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem(AUTH_KEY, "1");
      setError("");
      onSuccess();
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero px-6 py-16">
      <div className="w-full max-w-md rounded-3xl bg-card p-10 shadow-elegant border border-gold/30">
        <div className="flex flex-col items-center">
          <div className="h-16 w-16 rounded-full overflow-hidden bg-white flex items-center justify-center ring-2 ring-gold/50">
            <img src={logoAsset.url} alt="Logo" className="h-full w-full object-cover" />
          </div>
          <h1 className="mt-4 font-serif text-3xl text-primary">Admin Panel</h1>
          <p className="mt-1 text-xs uppercase tracking-widest text-gold font-semibold">Righwedh Sanjivni</p>
        </div>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <label className="block text-sm font-medium">
            Admin Email
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-ring"
              autoComplete="username"
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:ring-2 focus:ring-ring"
              autoComplete="current-password"
            />
          </label>
          {error && <div className="text-sm text-destructive">{error}</div>}
          <button className="w-full rounded-full bg-gradient-gold py-3.5 font-semibold text-gold-foreground shadow-gold hover:opacity-90">
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "members", label: "Members", icon: Users },
  { id: "kyc", label: "KYC Approvals", icon: ShieldCheck },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "tree", label: "Genealogy Tree", icon: GitBranch },
  { id: "commissions", label: "Commissions", icon: TrendingUp },
  { id: "withdrawals", label: "Withdrawals", icon: Wallet },
  { id: "announcements", label: "Announcements", icon: Megaphone },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "settings", label: "Plan Settings", icon: Settings },
] as const;

type TabId = (typeof NAV)[number]["id"];

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<TabId>("dashboard");

  return (
    <div className="min-h-screen bg-cream flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-primary text-primary-foreground min-h-screen sticky top-0 flex flex-col">
        <div className="px-6 py-5 border-b border-primary-foreground/10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-white ring-2 ring-gold/50 flex items-center justify-center">
            <img src={logoAsset.url} alt="Logo" className="h-full w-full object-cover" />
          </div>
          <div className="leading-tight">
            <div className="font-serif font-bold">Righwedh</div>
            <div className="text-[10px] uppercase tracking-widest text-gold">Admin</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map((n) => {
            const active = tab === n.id;
            return (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  active ? "bg-gradient-gold text-gold-foreground font-semibold shadow-gold" : "text-primary-foreground/80 hover:bg-primary-foreground/10"
                }`}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-primary-foreground/10">
          <button onClick={onLogout} className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm hover:bg-primary-foreground/10">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1">
        <div className="border-b border-border bg-background px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <div className="text-xs uppercase tracking-widest text-gold font-semibold">Admin</div>
            <h1 className="font-serif text-2xl text-primary">{NAV.find((n) => n.id === tab)?.label}</h1>
          </div>
          <div className="text-sm text-muted-foreground">Logged in as <b className="text-primary">{ADMIN_EMAIL}</b></div>
        </div>
        <div className="p-8">
          {tab === "dashboard" && <TabDashboard />}
          {tab === "members" && <TabMembers />}
          {tab === "kyc" && <TabKyc />}
          {tab === "products" && <TabProducts />}
          {tab === "orders" && <TabOrders />}
          {tab === "tree" && <TabTree />}
          {tab === "commissions" && <TabCommissions />}
          {tab === "withdrawals" && <TabWithdrawals />}
          {tab === "announcements" && <TabAnnouncements />}
          {tab === "reports" && <TabReports />}
          {tab === "settings" && <TabSettings />}
        </div>
      </main>
    </div>
  );
}

/* ---------- Tab views (demo data) ---------- */

function StatCard({ icon: Icon, label, value, delta }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; delta?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="h-10 w-10 rounded-lg bg-gradient-gold flex items-center justify-center shadow-gold">
          <Icon className="h-5 w-5 text-gold-foreground" />
        </div>
        {delta && <span className="text-xs text-green-700 font-semibold">{delta}</span>}
      </div>
      <div className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-serif text-3xl text-primary">{value}</div>
    </div>
  );
}

function TabDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={Users} label="Total Members" value="1,284" delta="+42 today" />
        <StatCard icon={ShoppingCart} label="Orders Today" value="76" delta="+12%" />
        <StatCard icon={IndianRupee} label="Sales (Today)" value="₹ 2,47,000" delta="+18%" />
        <StatCard icon={Wallet} label="Pending Payouts" value="₹ 84,500" />
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="font-serif text-xl text-primary">Recent Activity</div>
          <ul className="mt-4 divide-y divide-border text-sm">
            {[
              { t: "New member registered — RS10284 · Sponsor: RS10102", tag: "Member" },
              { t: "Order #1128 · Aaurva Capsule x1 · ₹3,250 · Paid via UPI", tag: "Order" },
              { t: "Commission generated — ₹900 direct + ₹300 pair", tag: "Commission" },
              { t: "Withdrawal request — RS10091 · ₹5,400", tag: "Payout" },
            ].map((r, i) => (
              <li key={i} className="py-3 flex justify-between gap-4">
                <span>{r.t}</span>
                <span className="text-xs bg-muted rounded-full px-2 py-0.5">{r.tag}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <div className="font-serif text-xl text-primary">Quick Actions</div>
          <div className="mt-4 grid gap-2">
            {["+ Add Product", "+ Add Announcement", "Approve KYC (3)", "Approve Payouts (5)"].map((a) => (
              <button key={a} className="text-left rounded-lg border border-border px-4 py-3 text-sm hover:bg-muted">{a}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Table<T extends Record<string, string | number>>({ rows, cols }: { rows: T[]; cols: { key: keyof T; label: string }[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>{cols.map((c) => <th key={String(c.key)} className="text-left px-4 py-3 font-semibold text-primary">{c.label}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-muted/50">
              {cols.map((c) => <td key={String(c.key)} className="px-4 py-3">{r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TabMembers() {
  const rows = [
    { id: "RS10001", name: "Kartik Tirgar", sponsor: "—", side: "Root", joined: "01 Jan 2026", status: "Active" },
    { id: "RS10102", name: "Ramesh Sharma", sponsor: "RS10001", side: "Left", joined: "12 Feb 2026", status: "Active" },
    { id: "RS10103", name: "Priya Verma", sponsor: "RS10001", side: "Right", joined: "18 Feb 2026", status: "Active" },
    { id: "RS10284", name: "Sunil Yadav", sponsor: "RS10102", side: "Left", joined: "17 Jul 2026", status: "Pending" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <input placeholder="Search by ID, name or sponsor…" className="w-80 rounded-full border border-input bg-background px-4 py-2.5 text-sm" />
        <button className="rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground shadow-gold flex items-center gap-2">
          <UserPlus className="h-4 w-4" /> Add Member
        </button>
      </div>
      <Table rows={rows} cols={[
        { key: "id", label: "Member ID" },
        { key: "name", label: "Name" },
        { key: "sponsor", label: "Sponsor" },
        { key: "side", label: "Side" },
        { key: "joined", label: "Joined" },
        { key: "status", label: "Status" },
      ]} />
    </div>
  );
}

function TabKyc() {
  const rows = [
    { id: "RS10284", name: "Sunil Yadav", doc: "Aadhaar + PAN", submitted: "17 Jul 2026" },
    { id: "RS10281", name: "Anita Devi", doc: "Aadhaar + PAN", submitted: "16 Jul 2026" },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
      <table className="w-full text-sm">
        <thead className="bg-muted"><tr>
          <th className="text-left px-4 py-3 text-primary">Member</th>
          <th className="text-left px-4 py-3 text-primary">Documents</th>
          <th className="text-left px-4 py-3 text-primary">Submitted</th>
          <th className="text-right px-4 py-3 text-primary">Action</th>
        </tr></thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-3"><b>{r.id}</b> · {r.name}</td>
              <td className="px-4 py-3">{r.doc}</td>
              <td className="px-4 py-3">{r.submitted}</td>
              <td className="px-4 py-3 text-right space-x-2">
                <button className="inline-flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-xs"><CheckCircle2 className="h-3.5 w-3.5" /> Approve</button>
                <button className="inline-flex items-center gap-1 rounded-full border border-destructive text-destructive px-3 py-1.5 text-xs"><XCircle className="h-3.5 w-3.5" /> Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TabProducts() {
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([
    { name: "Aaurva Capsule", cat: "Wellness", mrp: "₹ 3,250", joining: "₹ 3,250", direct: "₹ 900", pair: "₹ 300", stock: 240, status: "Active" },
    { name: "Immuno Shakti Syrup", cat: "Immunity", mrp: "₹ 850", joining: "₹ 850", direct: "₹ 240", pair: "₹ 80", stock: 180, status: "Active" },
    { name: "Detox Plus Churna", cat: "Detox", mrp: "₹ 650", joining: "₹ 650", direct: "₹ 180", pair: "₹ 60", stock: 120, status: "Active" },
    { name: "Kesh Vardhak Hair Oil", cat: "Hair Care", mrp: "₹ 550", joining: "₹ 550", direct: "₹ 150", pair: "₹ 50", stock: 95, status: "Active" },
    { name: "Twak Glow Face Cream", cat: "Skin Care", mrp: "₹ 950", joining: "₹ 950", direct: "₹ 270", pair: "₹ 90", stock: 60, status: "Active" },
    { name: "Joint Relief Oil", cat: "Joint Care", mrp: "₹ 720", joining: "₹ 720", direct: "₹ 200", pair: "₹ 70", stock: 145, status: "Active" },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Add or edit any product. Each product has its own <b className="text-primary">Joining Fee (MRP)</b>, <b className="text-primary">Direct Sale Commission</b> and <b className="text-primary">Pair Matching Bonus</b>.
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground shadow-gold"
        >
          {showForm ? "Close" : "+ Add Product"}
        </button>
      </div>

      {showForm && <ProductForm onCancel={() => setShowForm(false)} onSave={(p) => { setProducts([p, ...products]); setShowForm(false); }} />}

      <Table
        rows={products}
        cols={[
          { key: "name", label: "Product" },
          { key: "cat", label: "Category" },
          { key: "mrp", label: "MRP" },
          { key: "joining", label: "Joining Fee" },
          { key: "direct", label: "Direct Comm." },
          { key: "pair", label: "Pair Match" },
          { key: "stock", label: "Stock" },
          { key: "status", label: "Status" },
        ]}
      />
    </div>
  );
}

function ProductForm({
  onCancel,
  onSave,
}: {
  onCancel: () => void;
  onSave: (p: { name: string; cat: string; mrp: string; joining: string; direct: string; pair: string; stock: number; status: string }) => void;
}) {
  const [name, setName] = useState("");
  const [cat, setCat] = useState("Wellness");
  const [desc, setDesc] = useState("");
  const [mrp, setMrp] = useState("");
  const [joining, setJoining] = useState("");
  const [direct, setDirect] = useState("");
  const [pair, setPair] = useState("");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState("Active");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    void desc;
    onSave({
      name: name || "Untitled Product",
      cat,
      mrp: `₹ ${mrp || "0"}`,
      joining: `₹ ${joining || mrp || "0"}`,
      direct: `₹ ${direct || "0"}`,
      pair: `₹ ${pair || "0"}`,
      stock: Number(stock) || 0,
      status,
    });
  };

  return (
    <form onSubmit={submit} className="rounded-2xl border border-gold/30 bg-card p-6 shadow-elegant space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-gold font-semibold">New Product</div>
          <div className="font-serif text-xl text-primary">Add product with its own commission plan</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Product Title">
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Immuno Shakti Syrup" className={inputCls} />
        </Field>
        <Field label="Category">
          <select value={cat} onChange={(e) => setCat(e.target.value)} className={inputCls}>
            {["Wellness", "Immunity", "Detox", "Hair Care", "Skin Care", "Joint Care", "Digestive", "Other"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Description">
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} placeholder="Short product description shown on the website…" className={inputCls} />
      </Field>

      <div className="grid md:grid-cols-4 gap-4">
        <Field label="MRP (₹)">
          <input type="number" value={mrp} onChange={(e) => setMrp(e.target.value)} required placeholder="3250" className={inputCls} />
        </Field>
        <Field label="Joining Fee (₹)">
          <input type="number" value={joining} onChange={(e) => setJoining(e.target.value)} placeholder="Same as MRP" className={inputCls} />
        </Field>
        <Field label="Direct Sale Commission (₹)">
          <input type="number" value={direct} onChange={(e) => setDirect(e.target.value)} required placeholder="900" className={inputCls} />
        </Field>
        <Field label="Pair Matching Bonus (₹)">
          <input type="number" value={pair} onChange={(e) => setPair(e.target.value)} required placeholder="300" className={inputCls} />
        </Field>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Field label="Stock">
          <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="100" className={inputCls} />
        </Field>
        <Field label="Status">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
            <option>Active</option><option>Draft</option><option>Out of Stock</option>
          </select>
        </Field>
        <Field label="Product Image">
          <input type="file" accept="image/*" className={`${inputCls} file:mr-3 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:px-3 file:py-1.5 file:text-xs`} />
        </Field>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold">Cancel</button>
        <button className="rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-semibold text-gold-foreground shadow-gold">Save Product</button>
      </div>
    </form>
  );
}

const inputCls = "w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-ring";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-primary mb-1.5 uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}

function TabOrders() {
  return <Table rows={[
    { id: "#1128", member: "RS10284", product: "Aaurva Capsule x1", amount: "₹ 3,250", pay: "UPI · PhonePe", status: "Paid" },
    { id: "#1127", member: "RS10103", product: "Aaurva Capsule x2", amount: "₹ 6,500", pay: "UPI · PhonePe", status: "Pending" },
  ]} cols={[
    { key: "id", label: "Order" }, { key: "member", label: "Member" }, { key: "product", label: "Items" },
    { key: "amount", label: "Amount" }, { key: "pay", label: "Payment" }, { key: "status", label: "Status" },
  ]} />;
}

function TabTree() {
  return (
    <div className="rounded-2xl border border-border bg-card p-10 shadow-soft text-center">
      <GitBranch className="h-10 w-10 text-gold mx-auto" />
      <div className="mt-3 font-serif text-2xl text-primary">Interactive Genealogy Tree</div>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
        Full binary tree with search by Member ID, "+" invite on any empty position, and downline BV summary
        will be activated when member registration goes live.
      </p>
    </div>
  );
}

function TabCommissions() {
  return <Table rows={[
    { date: "17 Jul", type: "Direct", from: "RS10284", to: "RS10102", amount: "₹ 900" },
    { date: "17 Jul", type: "Pair", from: "RS10102/RS10103", to: "RS10001", amount: "₹ 300" },
  ]} cols={[
    { key: "date", label: "Date" }, { key: "type", label: "Type" }, { key: "from", label: "From" },
    { key: "to", label: "Credited To" }, { key: "amount", label: "Amount" },
  ]} />;
}

function TabWithdrawals() {
  return <Table rows={[
    { id: "W-102", member: "RS10091", amount: "₹ 5,400", bank: "SBI ****4421", requested: "16 Jul", status: "Pending" },
    { id: "W-101", member: "RS10064", amount: "₹ 2,700", bank: "HDFC ****9910", requested: "15 Jul", status: "Approved" },
  ]} cols={[
    { key: "id", label: "Request" }, { key: "member", label: "Member" }, { key: "amount", label: "Amount" },
    { key: "bank", label: "Bank" }, { key: "requested", label: "Requested" }, { key: "status", label: "Status" },
  ]} />;
}

function TabAnnouncements() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="font-serif text-xl text-primary">Post an announcement</div>
      <input placeholder="Title" className="mt-4 w-full rounded-xl border border-input px-4 py-3 text-sm bg-background" />
      <textarea placeholder="Message shown on all member dashboards…" rows={5} className="mt-3 w-full rounded-xl border border-input px-4 py-3 text-sm bg-background" />
      <button className="mt-4 rounded-full bg-gradient-gold px-5 py-2.5 text-sm font-semibold text-gold-foreground shadow-gold">Publish</button>
    </div>
  );
}

function TabReports() {
  return (
    <div className="grid md:grid-cols-3 gap-5">
      {["Daily Sales", "Member Growth", "Commission Payouts", "Product Stock", "KYC Status", "Withdrawal Ledger"].map((r) => (
        <div key={r} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <FileText className="h-6 w-6 text-gold" />
          <div className="mt-3 font-serif text-lg text-primary">{r}</div>
          <button className="mt-3 text-xs font-semibold text-primary hover:text-primary-glow">Download CSV →</button>
        </div>
      ))}
    </div>
  );
}

function TabSettings() {
  const rows = [
    { k: "Product MRP", v: "₹ 3,250" },
    { k: "Direct Sale Commission", v: "₹ 900" },
    { k: "Pair Matching Bonus", v: "₹ 300" },
    { k: "Daily Pair Capping", v: "20 pairs / day" },
    { k: "Minimum Withdrawal", v: "₹ 500" },
    { k: "TDS Deduction", v: "5%" },
    { k: "Admin Charges on Payout", v: "10%" },
    { k: "UPI ID", v: "kartiktirgar@ybl" },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
      <table className="w-full text-sm">
        <thead className="bg-muted"><tr>
          <th className="text-left px-4 py-3 text-primary">Setting</th>
          <th className="text-left px-4 py-3 text-primary">Value</th>
          <th className="text-right px-4 py-3 text-primary">Action</th>
        </tr></thead>
        <tbody className="divide-y divide-border">
          {rows.map((r) => (
            <tr key={r.k}>
              <td className="px-4 py-3">{r.k}</td>
              <td className="px-4 py-3 font-semibold text-primary">{r.v}</td>
              <td className="px-4 py-3 text-right"><button className="text-xs font-semibold text-primary">Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
