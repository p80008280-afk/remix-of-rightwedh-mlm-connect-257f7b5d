import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  LayoutDashboard, Users, Package, ShoppingCart, Wallet, LogOut,
  IndianRupee, CheckCircle2, XCircle, Plus, Settings, Database, Download,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DatabaseConsole from "@/components/DatabaseConsole";
import {
  reviewOrder, reviewWithdrawal, upsertProduct, updateMemberStatus, updatePlanSettings,
  adminAddMember, adminSetAccountState, adminSetMemberPassword,
} from "@/lib/mlm.functions";
const logoAsset = { url: "/logo.png" };
const qrAsset = { url: "/phonepe-qr.png" };

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Righvedh Sanjivni" },
      { name: "description", content: "Manage Righvedh Sanjivni members, products, orders, withdrawals, and payment settings." },
      { property: "og:title", content: "Admin Panel — Righvedh Sanjivni" },
      { property: "og:description", content: "Secure Righvedh Sanjivni administration panel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Admin,
});

type Profile = { id: string; full_name: string; username: string | null; email: string; phone: string; referral_code: string; member_code: string; is_active: boolean; account_status: string; login_password: string | null; kyc_status: string; created_at: string };
type NewMember = { fullName: string; mobile: string; realEmail: string; dob: string; password: string; sponsorCode: string; position: "left" | "right"; activate: boolean };
type Product = { id: string; name: string; description: string; category: string; image_url: string; mrp: number; direct_commission: number; pair_bonus: number; stock: number; status: string };
type Order = { id: string; user_id: string; product_id: string; amount: number; quantity: number; status: string; upi_reference: string; payment_screenshot_url: string | null; admin_note: string | null; created_at: string; cart_group: string | null; ship_name: string | null; ship_phone: string | null; ship_address: string | null; ship_city: string | null; ship_state: string | null; ship_pincode: string | null };
type Withdrawal = { id: string; user_id: string; amount: number; upi_id: string; status: string; created_at: string };
type PlanSettings = {
  min_withdrawal: number; tds_percent: number; admin_charge: number; withdrawal_days: number;
  daily_pair_cap: number; refund_days: number; monthly_repurchase: boolean;
  upi_id: string; payment_account_name: string; qr_image_url: string; qr_image_path?: string;
};

function Admin() {
  const nav = useNavigate();
  const [tab, setTab] = useState<"dash" | "members" | "products" | "orders" | "withdrawals" | "settings" | "records" | "database">("dash");
  const [openOrder, setOpenOrder] = useState<Order | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [members, setMembers] = useState<Profile[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [settings, setSettings] = useState<PlanSettings | null>(null);
  const [ask, setAsk] = useState<AskState>(null);
  const [notice, setNotice] = useState("");

  const rvOrder = useServerFn(reviewOrder);
  const rvWd = useServerFn(reviewWithdrawal);
  const upProd = useServerFn(upsertProduct);
  const upMem = useServerFn(updateMemberStatus);
  const upSettings = useServerFn(updatePlanSettings);
  const addMember = useServerFn(adminAddMember);
  const setState = useServerFn(adminSetAccountState);
  const setPassword = useServerFn(adminSetMemberPassword);

  async function loadAll() {
    const [m, p, o, w, ps] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("created_at"),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("withdrawals").select("*").order("created_at", { ascending: false }),
      supabase.from("plan_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    setMembers((m.data || []) as Profile[]);
    setProducts((p.data || []) as Product[]);
    setOrders((o.data || []) as Order[]);
    setWithdrawals((w.data || []) as Withdrawal[]);
    if (ps.data) setSettings(ps.data as PlanSettings);
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
      <Link to="/dashboard" className="text-primary underline">Go to your dashboard</Link>
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
            <div className="font-serif font-bold">Righvedh</div>
            <div className="text-[10px] uppercase tracking-widest text-gold">Admin</div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <SideBtn active={tab==="dash"} onClick={() => setTab("dash")} icon={LayoutDashboard} label="Dashboard" />
          <SideBtn active={tab==="members"} onClick={() => setTab("members")} icon={Users} label="Members" />
          <SideBtn active={tab==="products"} onClick={() => setTab("products")} icon={Package} label="Products" />
          <SideBtn active={tab==="orders"} onClick={() => setTab("orders")} icon={ShoppingCart} label={`Orders${pendingOrders.length?` (${pendingOrders.length})`:""}`} />
          <SideBtn active={tab==="withdrawals"} onClick={() => setTab("withdrawals")} icon={Wallet} label={`Withdrawals${pendingWd.length?` (${pendingWd.length})`:""}`} />
          <SideBtn active={tab==="settings"} onClick={() => setTab("settings")} icon={Settings} label="Payment Settings" />
          <SideBtn active={tab==="records"} onClick={() => setTab("records")} icon={Download} label="Records / Data" />
          <SideBtn active={tab==="database"} onClick={() => setTab("database")} icon={Database} label="Database" />
        </nav>
        <button onClick={logout} className="m-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 text-sm">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-10">
        <div className="md:hidden flex gap-1 mb-4 overflow-x-auto text-xs">
          {(["dash","members","products","orders","withdrawals","settings","records","database"] as const).map(t => (
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
            {settings && (
              <div className="rounded-2xl bg-card border border-border p-6 shadow-soft grid gap-4 md:grid-cols-[1fr_auto] items-center">
                <div>
                  <h2 className="font-serif text-2xl text-primary">Payment QR & UPI</h2>
                  <p className="text-sm text-muted-foreground mt-1">Current checkout UPI: <b className="text-primary">{settings.upi_id}</b> · {settings.payment_account_name}</p>
                </div>
                <button onClick={() => setTab("settings")} className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold">Edit Payment Settings</button>
              </div>
            )}
          </div>
        )}

        {tab === "members" && (
          <MembersTab
            members={members}
            onReload={loadAll}
            onKyc={async (userId, kyc) => { await upMem({ data: { userId, kyc_status: kyc as any } }); loadAll(); }}
            onState={async (userId, patch) => { await setState({ data: { userId, ...patch } as any }); loadAll(); }}
            onPassword={async (userId, newPassword) => { await setPassword({ data: { userId, newPassword } }); loadAll(); }}
            onAdd={async (payload) => { const res = await addMember({ data: payload as any }); await loadAll(); return res; }}
          />
        )}

        {tab === "products" && (
          <ProductsTab products={products} onSave={async (p) => { await upProd({ data: p as any }); loadAll(); }} />
        )}

        {tab === "orders" && (
          <Card title={`Orders (${orders.length}) — ${pendingOrders.length} pending review`}>
            <p className="text-xs text-muted-foreground mb-4">Verify each pending order by viewing the payment screenshot. If the amount and receiver UPI ({settings?.upi_id || "current admin UPI"}) match, click <b>Approve</b> — commissions are paid automatically and the member becomes active. Otherwise click <b>Reject</b>.</p>
            {orders.length === 0 && <p className="text-sm text-muted-foreground py-6 text-center">No orders yet. As soon as a member checks out from Shop / Cart, the order appears here with their delivery address and payment screenshot.</p>}
            <TableWrap cols={["Date","Member","Product","Delivery Address","Amount","UPI Ref","Proof","Status","Action"]}>
              {orders.map(o => {
                const mem = memberMap.get(o.user_id);
                const pr = prodMap.get(o.product_id);
                return (
                  <tr key={o.id} className="border-b border-border/50 align-top hover:bg-muted/40 cursor-pointer" onClick={() => setOpenOrder(o)}>
                    <td className="py-2 px-2 text-xs whitespace-nowrap">{new Date(o.created_at).toLocaleString()}</td>
                    <td className="py-2 px-2">
                      <div className="font-medium">{mem?.full_name || o.user_id.slice(0, 8)}</div>
                      <div className="text-xs text-muted-foreground">{mem?.email}</div>
                      <div className="text-xs text-muted-foreground">{mem?.phone}</div>
                    </td>
                    <td className="py-2 px-2">{pr?.name || "—"}{o.quantity > 1 ? ` × ${o.quantity}` : ""}</td>
                    <td className="py-2 px-2 text-xs max-w-[220px]">
                      <div className="font-medium">{o.ship_name || "—"}</div>
                      <div className="text-muted-foreground">{o.ship_phone}</div>
                      <div className="text-muted-foreground truncate">{[o.ship_address, o.ship_city, o.ship_state, o.ship_pincode].filter(Boolean).join(", ") || "—"}</div>
                      <span className="text-primary underline">View full details</span>
                    </td>
                    <td className="py-2 px-2 font-semibold">₹{o.amount}</td>
                    <td className="py-2 px-2 font-mono text-xs">{o.upi_reference || "—"}</td>
                    <td className="py-2 px-2" onClick={(e) => e.stopPropagation()}>
                      {o.payment_screenshot_url ? (
                        <a href={o.payment_screenshot_url} target="_blank" rel="noreferrer" className="inline-block">
                          <img src={o.payment_screenshot_url} alt="proof" className="h-16 w-16 object-cover rounded border border-border hover:ring-2 hover:ring-gold" />
                        </a>
                      ) : <span className="text-xs text-muted-foreground">No proof</span>}
                    </td>
                    <td className="py-2 px-2"><StatusPill status={o.status} /></td>
                    <td className="py-2 px-2" onClick={(e) => e.stopPropagation()}>
                      {o.status === "pending" ? (
                        <div className="flex flex-col gap-1">
                          <button onClick={() => setAsk({
                            title: "Approve this order?",
                            message: `₹${o.amount} order for ${mem?.full_name || "member"} will be approved and commissions will be paid.`,
                            confirmLabel: "Approve",
                            onConfirm: async () => { await rvOrder({ data: { orderId: o.id, action: "approve" } }); await loadAll(); setNotice("Order approved."); },
                          })} className="rounded bg-green-600 text-white px-3 py-1 text-xs font-semibold">✓ Approve</button>
                          <button onClick={() => setAsk({
                            title: "Reject this order?",
                            input: { label: "Reason for rejection" },
                            confirmLabel: "Reject order",
                            tone: "danger",
                            onConfirm: async (note) => { await rvOrder({ data: { orderId: o.id, action: "reject", note } }); await loadAll(); setNotice("Order rejected."); },
                          })} className="rounded bg-red-600 text-white px-3 py-1 text-xs font-semibold">✗ Reject</button>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">{o.admin_note || "—"}</span>}
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
                          <button onClick={() => setAsk({
                            title: "Mark as paid?",
                            message: `₹${w.amount} will be marked paid to ${w.upi_id}.`,
                            confirmLabel: "Mark paid",
                            onConfirm: async () => { await rvWd({ data: { withdrawalId: w.id, action: "approve" } }); await loadAll(); setNotice("Withdrawal marked paid."); },
                          })} className="rounded bg-green-600 text-white px-2 py-1 text-xs">Paid</button>
                          <button onClick={() => setAsk({
                            title: "Reject this withdrawal?",
                            input: { label: "Reason (optional)" },
                            confirmLabel: "Reject",
                            tone: "danger",
                            onConfirm: async (note) => { await rvWd({ data: { withdrawalId: w.id, action: "reject", note } }); await loadAll(); setNotice("Withdrawal rejected."); },
                          })} className="rounded bg-red-600 text-white px-2 py-1 text-xs">Reject</button>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                  </tr>
                );
              })}
            </TableWrap>
          </Card>
        )}

        {tab === "settings" && settings && (
          <SettingsTab
            settings={settings}
            onSave={async (next) => { await upSettings({ data: next }); await loadAll(); }}
          />
        )}

        {tab === "records" && (
          <RecordsTab members={members} products={products} orders={orders} withdrawals={withdrawals} />
        )}

        {tab === "database" && <DatabaseConsole />}
      </main>
      <OrderDetailModal
        order={openOrder}
        memberName={openOrder ? (memberMap.get(openOrder.user_id)?.full_name || "") : ""}
        memberCode={openOrder ? (memberMap.get(openOrder.user_id)?.member_code || "") : ""}
        productName={openOrder ? (prodMap.get(openOrder.product_id)?.name || "") : ""}
        onClose={() => setOpenOrder(null)}
      />
      <AskDialog state={ask} onClose={() => setAsk(null)} />
      <Notice text={notice} onClose={() => setNotice("")} />
    </div>
  );
}

function OrderDetailModal({ order, memberName, memberCode, productName, onClose }: {
  order: Order | null; memberName: string; memberCode: string; productName: string; onClose: () => void;
}) {
  if (!order) return null;
  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex gap-3 py-1.5 border-b border-border/50 text-sm">
      <div className="w-40 shrink-0 text-muted-foreground">{label}</div>
      <div className="flex-1 font-medium break-words">{value || "—"}</div>
    </div>
  );
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-6 overflow-y-auto" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-card rounded-2xl p-8 max-w-2xl w-full shadow-elegant my-8">
        <h3 className="font-serif text-2xl text-primary">Order Details</h3>
        <p className="text-xs text-muted-foreground mt-1">Placed {new Date(order.created_at).toLocaleString()}</p>

        <h4 className="mt-5 text-sm font-semibold text-primary uppercase tracking-wide">Customer</h4>
        <Row label="Member" value={`${memberName}${memberCode ? ` (${memberCode})` : ""}`} />
        <Row label="Product" value={`${productName} × ${order.quantity}`} />
        <Row label="Amount" value={`₹${order.amount}`} />
        <Row label="Status" value={<StatusPill status={order.status} />} />

        <h4 className="mt-5 text-sm font-semibold text-primary uppercase tracking-wide">Delivery Address</h4>
        <Row label="Name" value={order.ship_name} />
        <Row label="Mobile" value={order.ship_phone} />
        <Row label="House / Street / Area" value={order.ship_address} />
        <Row label="City" value={order.ship_city} />
        <Row label="State" value={order.ship_state} />
        <Row label="Pincode" value={order.ship_pincode} />

        <h4 className="mt-5 text-sm font-semibold text-primary uppercase tracking-wide">Payment</h4>
        <Row label="UPI reference" value={order.upi_reference} />
        <Row label="Admin note" value={order.admin_note} />
        {order.payment_screenshot_url && (
          <a href={order.payment_screenshot_url} target="_blank" rel="noreferrer">
            <img src={order.payment_screenshot_url} alt="Payment proof" className="mt-3 max-h-72 rounded-xl border border-border" />
          </a>
        )}

        <button onClick={onClose} className="mt-6 w-full rounded-full bg-gradient-gold py-2.5 text-sm font-semibold text-gold-foreground">Close</button>
      </div>
    </div>
  );
}

const RECORD_TABLES = ["members", "orders", "withdrawals", "products"] as const;
type RecordTable = typeof RECORD_TABLES[number];

function RecordsTab({ members, products, orders, withdrawals }: {
  members: Profile[]; products: Product[]; orders: Order[]; withdrawals: Withdrawal[];
}) {
  const [table, setTable] = useState<RecordTable>("members");
  const [q, setQ] = useState("");

  const source: Record<RecordTable, any[]> = { members, orders, withdrawals, products };
  const rows = source[table];
  const cols = rows.length ? Object.keys(rows[0]) : [];
  const filtered = q.trim()
    ? rows.filter(r => JSON.stringify(r).toLowerCase().includes(q.trim().toLowerCase()))
    : rows;

  function exportCsv() {
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(","), ...filtered.map(r => cols.map(c => esc(r[c])).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `righvedh-${table}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card title="Records / Data">
      <p className="text-xs text-muted-foreground mb-4">Complete stored data for every section. Use the search box to find any record, and download a spreadsheet (CSV) copy for your own records or accountant.</p>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {RECORD_TABLES.map(t => (
          <button key={t} onClick={() => setTable(t)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize ${table === t ? "bg-primary text-primary-foreground" : "border border-input"}`}>
            {t} ({source[t].length})
          </button>
        ))}
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search records..." className="rounded-full border border-input bg-background px-4 py-1.5 text-xs flex-1 min-w-[180px]" />
        <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-gold px-4 py-1.5 text-xs font-semibold text-gold-foreground">
          <Download className="h-3.5 w-3.5" /> Download CSV
        </button>
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No records in this section yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border">
                {cols.map(c => <th key={c} className="py-2 px-2 whitespace-nowrap uppercase tracking-wide text-[10px] text-muted-foreground">{c.replace(/_/g, " ")}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id || i} className="border-b border-border/50 hover:bg-muted/40">
                  {cols.map(c => <td key={c} className="py-2 px-2 max-w-[220px] truncate" title={String(r[c] ?? "")}>{String(r[c] ?? "—")}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
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
  const blank: Partial<Product> = { name: "", description: "", category: "General", image_url: "", mrp: 3250, direct_commission: 500, pair_bonus: 500, stock: 100, status: "active" };

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
                <ImageUploadField
                  label="Product Image"
                  value={editing.image_url || ""}
                  folder="products"
                  onChange={(url) => setEditing(prev => ({ ...(prev || {}), image_url: url }))}
                />
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

function SettingsTab({ settings, onSave }: { settings: PlanSettings; onSave: (settings: PlanSettings) => Promise<void> }) {
  const [form, setForm] = useState<PlanSettings>(settings);
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      let next = { ...form };
      if (file) {
        const ext = file.name.split(".").pop() || "png";
        const path = `qr/payment-qr-${Date.now()}.${ext}`;
        const upload = await supabase.storage.from("payment-assets").upload(path, file, { upsert: false });
        if (upload.error) throw upload.error;
        const signed = await supabase.storage.from("payment-assets").createSignedUrl(path, 60 * 60 * 24 * 365);
        next = { ...next, qr_image_path: path, qr_image_url: signed.data?.signedUrl || qrAsset.url };
      }
      await onSave(next);
      setForm(next);
      setFile(null);
      setMsg("Payment settings updated.");
    } catch (err: any) {
      setMsg("Error: " + (err.message || String(err)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Payment & Plan Settings">
      {msg && <div className="mb-4 rounded-lg bg-primary/10 text-primary text-sm p-3">{msg}</div>}
      <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <F label="Checkout UPI ID"><input required value={form.upi_id} onChange={e => setForm({ ...form, upi_id: e.target.value })} className="w-full rounded border px-3 py-2" /></F>
            <F label="Payment Account Name"><input required value={form.payment_account_name} onChange={e => setForm({ ...form, payment_account_name: e.target.value })} className="w-full rounded border px-3 py-2" /></F>
          </div>
          <F label="Upload New QR Image"><input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full rounded border px-3 py-2 text-sm" /></F>
          <div className="grid sm:grid-cols-3 gap-4">
            <F label="Minimum Withdrawal ₹"><input type="number" required value={form.min_withdrawal} onChange={e => setForm({ ...form, min_withdrawal: Number(e.target.value) })} className="w-full rounded border px-3 py-2" /></F>
            <F label="TDS %"><input type="number" required value={form.tds_percent} onChange={e => setForm({ ...form, tds_percent: Number(e.target.value) })} className="w-full rounded border px-3 py-2" /></F>
            <F label="Admin Charge ₹"><input type="number" required value={form.admin_charge} onChange={e => setForm({ ...form, admin_charge: Number(e.target.value) })} className="w-full rounded border px-3 py-2" /></F>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <F label="Withdrawal Days"><input type="number" required value={form.withdrawal_days} onChange={e => setForm({ ...form, withdrawal_days: Number(e.target.value) })} className="w-full rounded border px-3 py-2" /></F>
            <F label="Daily Pair Capping"><input type="number" required value={form.daily_pair_cap} onChange={e => setForm({ ...form, daily_pair_cap: Number(e.target.value) })} className="w-full rounded border px-3 py-2" /></F>
            <F label="Refund Days"><input type="number" required value={form.refund_days} onChange={e => setForm({ ...form, refund_days: Number(e.target.value) })} className="w-full rounded border px-3 py-2" /></F>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <input type="checkbox" checked={form.monthly_repurchase} onChange={e => setForm({ ...form, monthly_repurchase: e.target.checked })} />
            Monthly repurchase is compulsory
          </label>
          <button disabled={busy} className="rounded-full bg-gradient-gold text-gold-foreground px-8 py-3 text-sm font-semibold disabled:opacity-60">{busy ? "Saving..." : "Save Settings"}</button>
        </div>
        <div className="rounded-2xl border border-border bg-background p-4 text-center h-fit">
          <img src={file ? URL.createObjectURL(file) : form.qr_image_url} onError={(event) => { event.currentTarget.src = qrAsset.url; }} alt="Current checkout QR" className="mx-auto w-52 rounded-xl bg-white p-2 border border-border" />
          <div className="mt-3 font-mono text-sm text-primary break-all">{form.upi_id}</div>
          <div className="text-xs text-muted-foreground">{form.payment_account_name}</div>
        </div>
      </form>
    </Card>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-muted-foreground">{label}<div className="mt-1">{children}</div></label>;
}

// Upload an image to storage and hand back a long-lived link.
function ImageUploadField({ label, value, folder, onChange }: { label: string; value: string; folder: string; onChange: (url: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function pick(file: File | null) {
    if (!file) return;
    setBusy(true); setErr("");
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const up = await supabase.storage.from("payment-assets").upload(path, file, { upsert: false });
      if (up.error) throw up.error;
      const signed = await supabase.storage.from("payment-assets").createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
      onChange(signed.data?.signedUrl || "");
    } catch (e: any) {
      setErr(e.message || "Upload failed");
    } finally { setBusy(false); }
  }
  return (
    <F label={label}>
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 rounded-lg border border-border bg-background overflow-hidden flex items-center justify-center text-[10px] text-muted-foreground">
          {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : "No image"}
        </div>
        <div className="flex-1">
          <input type="file" accept="image/*" disabled={busy} onChange={e => pick(e.target.files?.[0] || null)} className="w-full rounded border px-3 py-2 text-sm" />
          {busy && <div className="text-xs text-muted-foreground mt-1">Uploading...</div>}
          {err && <div className="text-xs text-destructive mt-1">{err}</div>}
        </div>
      </div>
    </F>
  );
}

type AskState = {
  title: string;
  message?: string;
  input?: { label: string; type?: string; required?: boolean };
  confirmLabel?: string;
  tone?: "default" | "danger";
  onConfirm: (value: string) => Promise<void> | void;
} | null;

// In-app replacement for browser confirm()/prompt()/alert().
function AskDialog({ state, onClose }: { state: AskState; onClose: () => void }) {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { setValue(""); }, [state]);
  if (!state) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-6" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-card rounded-2xl p-6 w-full max-w-md shadow-elegant">
        <h3 className="font-serif text-xl text-primary">{state.title}</h3>
        {state.message && <p className="mt-2 text-sm text-muted-foreground">{state.message}</p>}
        {state.input && (
          <div className="mt-4">
            <F label={state.input.label}>
              <input
                autoFocus
                type={state.input.type || "text"}
                value={value}
                onChange={e => setValue(e.target.value)}
                className="w-full rounded border px-3 py-2"
              />
            </F>
          </div>
        )}
        <div className="mt-6 flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border py-2.5 text-sm">Cancel</button>
          <button
            type="button"
            disabled={busy || (state.input?.required && !value.trim())}
            onClick={async () => { setBusy(true); try { await state.onConfirm(value); onClose(); } finally { setBusy(false); } }}
            className={`flex-1 rounded-full py-2.5 text-sm font-semibold disabled:opacity-60 ${state.tone === "danger" ? "bg-destructive text-destructive-foreground" : "bg-gradient-gold text-gold-foreground"}`}
          >{busy ? "Please wait..." : (state.confirmLabel || "Confirm")}</button>
        </div>
      </div>
    </div>
  );
}

function Notice({ text, onClose }: { text: string; onClose: () => void }) {
  if (!text) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[70] rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm shadow-elegant flex items-center gap-3">
      {text}
      <button onClick={onClose} className="opacity-70 hover:opacity-100">✕</button>
    </div>
  );
}

function MembersTab({
  members, onReload, onKyc, onState, onPassword, onAdd,
}: {
  members: Profile[];
  onReload: () => Promise<void> | void;
  onKyc: (userId: string, kyc: string) => Promise<void>;
  onState: (userId: string, patch: { account_status?: string; is_active?: boolean }) => Promise<void>;
  onPassword: (userId: string, newPassword: string) => Promise<void>;
  onAdd: (payload: NewMember) => Promise<{ memberCode: string; referralCode: string }>;
}) {
  const blank: NewMember = { fullName: "", mobile: "", realEmail: "", dob: "", password: "", sponsorCode: "", position: "left", activate: false };
  const [form, setForm] = useState<NewMember | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [created, setCreated] = useState<{ memberCode: string; mobile: string; password: string } | null>(null);
  const [showPass, setShowPass] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [ask, setAsk] = useState<AskState>(null);
  const [notice, setNotice] = useState("");

  const rows = members.filter(m => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [m.full_name, m.phone, m.email, m.referral_code, m.member_code].some(v => (v || "").toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl text-primary">Members ({members.length})</h2>
        <div className="flex gap-2">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search name / mobile / ID"
            className="rounded-full border border-border bg-card px-4 py-2 text-sm"
          />
          <button onClick={() => { setErr(""); setForm(blank); }} className="rounded-full bg-gradient-gold text-gold-foreground px-4 py-2 text-sm font-semibold flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add Member
          </button>
        </div>
      </div>

      <Card title="All Members">
        <TableWrap cols={["Name","User ID","Mobile","Email","Password","Ref Code","Paid / ID","Account","KYC","Joined","Actions"]}>
          {rows.map(m => (
            <tr key={m.id} className="border-b border-border/50 align-top">
              <td className="py-2 px-2">{m.full_name || "—"}</td>
              <td className="py-2 px-2 font-mono text-xs text-primary">{m.member_code || "—"}</td>
              <td className="py-2 px-2">{m.phone || "—"}</td>
              <td className="py-2 px-2 text-xs">{m.email}</td>
              <td className="py-2 px-2 text-xs">
                {m.login_password
                  ? (showPass[m.id]
                      ? <span className="font-mono">{m.login_password}</span>
                      : <button onClick={() => setShowPass(s => ({ ...s, [m.id]: true }))} className="text-primary underline">Show</button>)
                  : <span className="text-muted-foreground">not stored</span>}
              </td>
              <td className="py-2 px-2 font-mono text-xs">{m.referral_code}</td>
              <td className="py-2 px-2">
                {m.is_active
                  ? <span className="text-green-600 font-semibold">Active</span>
                  : <button
                      onClick={() => setAsk({
                        title: "Activate this ID?",
                        message: `${m.full_name}'s ID will be marked as paid and income will start.`,
                        confirmLabel: "Activate ID",
                        onConfirm: async () => { await onState(m.id, { is_active: true }); setNotice("ID activated."); },
                      })}
                      className="rounded bg-green-600 text-white px-2 py-1 text-xs font-semibold">Activate ID</button>}
              </td>
              <td className="py-2 px-2">
                <select
                  value={m.account_status || "active"}
                  onChange={async (e) => { await onState(m.id, { account_status: e.target.value }); }}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </td>
              <td className="py-2 px-2">
                <select
                  defaultValue=""
                  onChange={async (e) => { const v = e.target.value; if (!v) return; await onKyc(m.id, v); e.currentTarget.value = ""; }}
                  className="text-xs border rounded px-2 py-1"
                >
                  <option value="">{m.kyc_status}</option>
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                  <option value="pending">Reset</option>
                </select>
              </td>
              <td className="py-2 px-2 text-xs">{new Date(m.created_at).toLocaleDateString()}</td>
              <td className="py-2 px-2">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setAsk({
                      title: "Set new password",
                      message: `New login password for ${m.full_name} (minimum 6 characters).`,
                      input: { label: "New password", required: true },
                      confirmLabel: "Update password",
                      onConfirm: async (v) => {
                        if (v.trim().length < 6) { setNotice("Password must be at least 6 characters."); return; }
                        await onPassword(m.id, v.trim());
                        setNotice("Password updated.");
                      },
                    })}
                    className="rounded bg-primary text-primary-foreground px-2 py-1 text-xs">Set password</button>
                  {m.is_active && (
                    <button
                      onClick={() => setAsk({
                        title: "Deactivate this ID?",
                        message: "The ID will be marked as not paid and income will stop.",
                        confirmLabel: "Deactivate",
                        tone: "danger",
                        onConfirm: async () => { await onState(m.id, { is_active: false }); setNotice("ID deactivated."); },
                      })}
                      className="rounded border border-border px-2 py-1 text-xs">Deactivate ID</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </TableWrap>
      </Card>

      {form && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6" onClick={() => setForm(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-card rounded-2xl p-8 max-w-xl w-full shadow-elegant max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-2xl text-primary mb-4">Add Member Manually</h3>
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true); setErr("");
                try {
                  const res = await onAdd({ ...form, mobile: form.mobile.replace(/\D/g, ""), sponsorCode: form.sponsorCode.trim().toUpperCase() });
                  setCreated({ memberCode: res.memberCode, mobile: form.mobile, password: form.password });
                  setForm(null);
                  await onReload();
                } catch (addError) {
                  setErr(addError instanceof Error ? addError.message : "Could not add member");
                } finally { setBusy(false); }
              }}
            >
              <F label="Full Name"><input required value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className="w-full rounded border px-3 py-2" /></F>
              <div className="grid sm:grid-cols-2 gap-3">
                <F label="Mobile Number (login ID)"><input required value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })} className="w-full rounded border px-3 py-2" /></F>
                <F label="Password"><input required minLength={6} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full rounded border px-3 py-2" /></F>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <F label="Email"><input required type="email" value={form.realEmail} onChange={e => setForm({ ...form, realEmail: e.target.value })} className="w-full rounded border px-3 py-2" /></F>
                <F label="Date of Birth"><input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} className="w-full rounded border px-3 py-2" /></F>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <F label="Sponsor Code (optional)"><input value={form.sponsorCode} onChange={e => setForm({ ...form, sponsorCode: e.target.value.toUpperCase() })} className="w-full rounded border px-3 py-2" /></F>
                <F label="Position">
                  <select value={form.position} onChange={e => setForm({ ...form, position: e.target.value as "left" | "right" })} className="w-full rounded border px-3 py-2">
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </F>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.activate} onChange={e => setForm({ ...form, activate: e.target.checked })} />
                Activate this ID immediately (payment already received)
              </label>
              {err && <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3">{err}</div>}
              <div className="flex gap-2 pt-2">
                <button disabled={busy} type="submit" className="rounded-full bg-gradient-gold text-gold-foreground px-5 py-2.5 text-sm font-semibold disabled:opacity-60">{busy ? "Creating…" : "Create Member"}</button>
                <button type="button" onClick={() => setForm(null)} className="rounded-full border border-border px-5 py-2.5 text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {created && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-6" onClick={() => setCreated(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-card rounded-2xl p-8 max-w-sm w-full shadow-elegant text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <h3 className="font-serif text-2xl text-primary mt-3">Member Created</h3>
            <div className="mt-4 rounded-xl bg-muted/40 p-4 text-left text-sm space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">User ID</span><b className="text-primary">{created.memberCode}</b></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Login mobile</span><b>{created.mobile}</b></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Password</span><b>{created.password}</b></div>
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(`User ID: ${created.memberCode}\nMobile: ${created.mobile}\nPassword: ${created.password}`)}
              className="mt-4 text-sm text-primary underline">Copy details</button>
            <button onClick={() => setCreated(null)} className="mt-4 w-full rounded-full bg-primary text-primary-foreground py-2.5 text-sm font-semibold">Done</button>
          </div>
        </div>
      )}

      <AskDialog state={ask} onClose={() => setAsk(null)} />
      <Notice text={notice} onClose={() => setNotice("")} />
    </div>
  );
}
