import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  LayoutDashboard, Users, Package, ShoppingCart, Wallet, LogOut,
  IndianRupee, CheckCircle2, XCircle, Plus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { reviewOrder, reviewWithdrawal, upsertProduct, updateMemberStatus } from "@/lib/mlm.functions";
import logoAsset from "@/assets/logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Righwedh Sanjivni" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Admin,
});

type Profile = { id: string; full_name: string; email: string; phone: string; referral_code: string; is_active: boolean; kyc_status: string; created_at: string };
type Product = { id: string; name: string; description: string; category: string; image_url: string; mrp: number; direct_commission: number; pair_bonus: number; stock: number; status: string };
type Order = { id: string; user_id: string; product_id: string; amount: number; status: string; upi_reference: string; created_at: string };
type Withdrawal = { id: string; user_id: string; amount: number; upi_id: string; status: string; created_at: string };

function Admin() {
  const nav = useNavigate();
  const [tab, setTab] = useState<"dash" | "members" | "products" | "orders" | "withdrawals">("dash");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  const rvOrder = useServerFn(reviewOrder);
  const rvWd = useServerFn(reviewWithdrawal);
  const upProd = useServerFn(upsertProduct);
  const upMem = useServerFn(updateMemberStatus);

  async function loadAll() {
    const [m, p, o, w] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("created_at"),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("withdrawals").select("*").order("created_at", { ascending: false }),
    ]);
    setMembers((m.data || []) as Profile[]);
    setProducts((p.data || []) as Product[]);
    setOrders((o.data || []) as Order[]);
    setWithdrawals((w.data || []) as Withdrawal[]);
  }

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) { nav({ to: "/login" }); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userRes.user.id);
      const admin = roles?.some(r => r.role === "admin") || false;
      setIsAdmin(admin);
      if (admin) loadAll();
    })();
  }, []);

  async function logout() { await supabase.auth.signOut(); nav({ to: "/" }); }

  if (isAdmin === null) return <div className="min-h-screen flex items-center justify-center">Checking access...</div>;
  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-6">
      <XCircle className="h-12 w-12 text-destructive" />
      <h1 className="font-serif text-2xl text-primary">Access Denied</h1>
      <p className="text-sm text-muted-foreground">You must be an admin to view this page.</p>
      <Link to="/_authenticated/dashboard" className="text-primary underline">Go to your dashboard</Link>
    </div>
  );

  const pendingOrders = orders.filter(o => o.status === "pending");
  const pendingWd = withdrawals.filter(w => w.status === "pending");
  const totalSales = orders.filter(o => o.status === "approved").reduce((s, o) => s + Number(o.amount), 0);

  const memberMap = new Map(members.map(m => [m.id, m]));
  const prodMap = new Map(products.map(p => [p.id, p]));

  return (
    <div className="min-h-screen flex bg-gradient-leaf">
      <aside className="w-64 bg-primary text-primary-foreground min-h-screen sticky top-0 hidden md:flex flex-col">
        <div className="px-6 py-5 border-b border-primary-foreground/10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-white ring-2 ring-gold/50">
            <img src={logoAsset.url} alt="Logo" className="h-full w-full object-cover" />
          </div>
          <div className="leading-tight">
            <div className="font-serif font-bold">Righwedh</div>
            <div className="text-[10px] uppercase tracking-widest text-gold">Admin</div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <SideBtn active={tab==="dash"} onClick={() => setTab("dash")} icon={LayoutDashboard} label="Dashboard" />
          <SideBtn active={tab==="members"} onClick={() => setTab("members")} icon={Users} label="Members" />
          <SideBtn active={tab==="products"} onClick={() => setTab("products")} icon={Package} label="Products" />
          <SideBtn active={tab==="orders"} onClick={() => setTab("orders")} icon={ShoppingCart} label={`Orders${pendingOrders.length?` (${pendingOrders.length})`:""}`} />
          <SideBtn active={tab==="withdrawals"} onClick={() => setTab("withdrawals")} icon={Wallet} label={`Withdrawals${pendingWd.length?` (${pendingWd.length})`:""}`} />
        </nav>
        <button onClick={logout} className="m-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-sm">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        <div className="md:hidden flex gap-1 mb-4 overflow-x-auto text-xs">
          {(["dash","members","products","orders","withdrawals"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 rounded-lg whitespace-nowrap ${tab===t?"bg-primary text-primary-foreground":"bg-card"}`}>{t}</button>
          ))}
        </div>

        {tab === "dash" && (
          <div className="space-y-6">
            <h1 className="font-serif text-3xl text-primary">Admin Dashboard</h1>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat icon={Users} label="Total Members" value={String(members.length)} />
              <Stat icon={CheckCircle2} label="Active Members" value={String(members.filter(m=>m.is_active).length)} />
              <Stat icon={ShoppingCart} label="Pending Orders" value={String(pendingOrders.length)} accent />
              <Stat icon={IndianRupee} label="Approved Sales" value={`₹${totalSales}`} accent />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Stat icon={Wallet} label="Pending Withdrawals" value={String(pendingWd.length)} />
              <Stat icon={Package} label="Active Products" value={String(products.filter(p=>p.status==="active").length)} />
            </div>
          </div>
        )}

        {tab === "members" && (
          <Card title={`Members (${members.length})`}>
            <TableWrap cols={["Name","Email","Phone","Ref Code","Status","KYC","Joined","Action"]}>
              {members.map(m => (
                <tr key={m.id} className="border-b border-border/50">
                  <td className="py-2 px-2">{m.full_name || "—"}</td>
                  <td className="py-2 px-2">{m.email}</td>
                  <td className="py-2 px-2">{m.phone || "—"}</td>
                  <td className="py-2 px-2 font-mono text-xs">{m.referral_code}</td>
                  <td className="py-2 px-2">{m.is_active ? <span className="text-green-600 font-semibold">Active</span> : <span className="text-amber-600">Pending</span>}</td>
                  <td className="py-2 px-2">{m.kyc_status}</td>
                  <td className="py-2 px-2 text-xs">{new Date(m.created_at).toLocaleDateString()}</td>
                  <td className="py-2 px-2">
                    <select
                      defaultValue=""
                      onChange={async (e) => {
                        const v = e.target.value; if (!v) return;
                        await upMem({ data: { userId: m.id, kyc_status: v as any } });
                        loadAll(); e.currentTarget.value = "";
                      }}
                      className="text-xs border rounded px-2 py-1"
                    >
                      <option value="">KYC…</option>
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                      <option value="pending">Reset</option>
                    </select>
                  </td>
                </tr>
              ))}
            </TableWrap>
          </Card>
        )}

        {tab === "products" && (
          <ProductsTab products={products} onSave={async (p) => { await upProd({ data: p as any }); loadAll(); }} />
        )}

        {tab === "orders" && (
          <Card title={`Orders (${orders.length})`}>
            <TableWrap cols={["Date","Member","Product","Amount","UPI Ref","Status","Action"]}>
              {orders.map(o => {
                const mem = memberMap.get(o.user_id);
                const pr = prodMap.get(o.product_id);
                return (
                  <tr key={o.id} className="border-b border-border/50">
                    <td className="py-2 px-2 text-xs">{new Date(o.created_at).toLocaleString()}</td>
                    <td className="py-2 px-2">{mem?.full_name || o.user_id.slice(0, 8)}<div className="text-xs text-muted-foreground">{mem?.email}</div></td>
                    <td className="py-2 px-2">{pr?.name || "—"}</td>
                    <td className="py-2 px-2 font-semibold">₹{o.amount}</td>
                    <td className="py-2 px-2 font-mono text-xs">{o.upi_reference}</td>
                    <td className="py-2 px-2"><StatusPill status={o.status} /></td>
                    <td className="py-2 px-2">
                      {o.status === "pending" ? (
                        <div className="flex gap-1">
                          <button onClick={async () => { await rvOrder({ data: { orderId: o.id, action: "approve" } }); loadAll(); }} className="rounded bg-green-600 text-white px-2 py-1 text-xs">Approve</button>
                          <button onClick={async () => { await rvOrder({ data: { orderId: o.id, action: "reject" } }); loadAll(); }} className="rounded bg-red-600 text-white px-2 py-1 text-xs">Reject</button>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                  </tr>
                );
              })}
            </TableWrap>
          </Card>
        )}

        {tab === "withdrawals" && (
          <Card title={`Withdrawals (${withdrawals.length})`}>
            <TableWrap cols={["Date","Member","Amount","UPI","Status","Action"]}>
              {withdrawals.map(w => {
                const mem = memberMap.get(w.user_id);
                return (
                  <tr key={w.id} className="border-b border-border/50">
                    <td className="py-2 px-2 text-xs">{new Date(w.created_at).toLocaleString()}</td>
                    <td className="py-2 px-2">{mem?.full_name || w.user_id.slice(0,8)}<div className="text-xs text-muted-foreground">{mem?.email}</div></td>
                    <td className="py-2 px-2 font-semibold">₹{w.amount}</td>
                    <td className="py-2 px-2 font-mono text-xs">{w.upi_id}</td>
                    <td className="py-2 px-2"><StatusPill status={w.status} /></td>
                    <td className="py-2 px-2">
                      {w.status === "pending" ? (
                        <div className="flex gap-1">
                          <button onClick={async () => { await rvWd({ data: { withdrawalId: w.id, action: "approve" } }); loadAll(); }} className="rounded bg-green-600 text-white px-2 py-1 text-xs">Paid</button>
                          <button onClick={async () => { await rvWd({ data: { withdrawalId: w.id, action: "reject" } }); loadAll(); }} className="rounded bg-red-600 text-white px-2 py-1 text-xs">Reject</button>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                  </tr>
                );
              })}
            </TableWrap>
          </Card>
        )}
      </main>
    </div>
  );
}

function SideBtn({ active, onClick, icon: Icon, label }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm ${active ? "bg-gold text-gold-foreground font-semibold" : "hover:bg-primary-foreground/10"}`}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
}

function Stat({ icon: Icon, label, value, accent }: any) {
  return (
    <div className={`rounded-2xl border p-5 shadow-soft ${accent ? "bg-gradient-gold text-gold-foreground border-gold/40" : "bg-card border-border"}`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-80"><Icon className="h-4 w-4" /> {label}</div>
      <div className="mt-2 font-serif text-2xl font-bold">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 shadow-soft">
      <h2 className="font-serif text-2xl text-primary mb-4">{title}</h2>
      {children}
    </div>
  );
}

function TableWrap({ cols, children }: { cols: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-muted-foreground border-b border-border">
            {cols.map(c => <th key={c} className="py-2 px-2">{c}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
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

function ProductsTab({ products, onSave }: { products: Product[]; onSave: (p: Partial<Product>) => Promise<void> }) {
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const blank: Partial<Product> = { name: "", description: "", category: "General", image_url: "", mrp: 3250, direct_commission: 900, pair_bonus: 300, stock: 100, status: "active" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-primary">Products ({products.length})</h2>
        <button onClick={() => setEditing(blank)} className="rounded-full bg-gradient-gold text-gold-foreground px-4 py-2 text-sm font-semibold flex items-center gap-1"><Plus className="h-4 w-4" /> Add Product</button>
      </div>
      <Card title="All Products">
        <TableWrap cols={["Name","Category","MRP","Direct","Pair","Stock","Status","Action"]}>
          {products.map(p => (
            <tr key={p.id} className="border-b border-border/50">
              <td className="py-2 px-2">{p.name}</td>
              <td className="py-2 px-2 text-xs">{p.category}</td>
              <td className="py-2 px-2">₹{p.mrp}</td>
              <td className="py-2 px-2">₹{p.direct_commission}</td>
              <td className="py-2 px-2">₹{p.pair_bonus}</td>
              <td className="py-2 px-2">{p.stock}</td>
              <td className="py-2 px-2">{p.status}</td>
              <td className="py-2 px-2"><button onClick={() => setEditing(p)} className="text-primary underline text-xs">Edit</button></td>
            </tr>
          ))}
        </TableWrap>
      </Card>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6" onClick={() => setEditing(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-card rounded-2xl p-8 max-w-2xl w-full shadow-elegant max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-2xl text-primary mb-4">{editing.id ? "Edit" : "Add"} Product</h3>
            <form onSubmit={async (e) => { e.preventDefault(); await onSave(editing); setEditing(null); }} className="space-y-3">
              <F label="Name"><input required value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full rounded border px-3 py-2" /></F>
              <F label="Description"><textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={2} className="w-full rounded border px-3 py-2" /></F>
              <div className="grid grid-cols-2 gap-3">
                <F label="Category"><input value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} className="w-full rounded border px-3 py-2" /></F>
                <F label="Image URL"><input value={editing.image_url} onChange={e => setEditing({ ...editing, image_url: e.target.value })} className="w-full rounded border px-3 py-2" /></F>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <F label="MRP ₹"><input type="number" required value={editing.mrp} onChange={e => setEditing({ ...editing, mrp: Number(e.target.value) })} className="w-full rounded border px-3 py-2" /></F>
                <F label="Direct Comm ₹"><input type="number" required value={editing.direct_commission} onChange={e => setEditing({ ...editing, direct_commission: Number(e.target.value) })} className="w-full rounded border px-3 py-2" /></F>
                <F label="Pair Bonus ₹"><input type="number" required value={editing.pair_bonus} onChange={e => setEditing({ ...editing, pair_bonus: Number(e.target.value) })} className="w-full rounded border px-3 py-2" /></F>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <F label="Stock"><input type="number" required value={editing.stock} onChange={e => setEditing({ ...editing, stock: Number(e.target.value) })} className="w-full rounded border px-3 py-2" /></F>
                <F label="Status">
                  <select value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })} className="w-full rounded border px-3 py-2">
                    <option value="active">Active</option><option value="inactive">Inactive</option>
                  </select>
                </F>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="flex-1 rounded-full border py-2.5">Cancel</button>
                <button className="flex-1 rounded-full bg-gradient-gold text-gold-foreground py-2.5 font-semibold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-muted-foreground">{label}<div className="mt-1">{children}</div></label>;
}
