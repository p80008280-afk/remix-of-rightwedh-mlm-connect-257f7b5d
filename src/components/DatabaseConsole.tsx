import { useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, Table2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type TableDef = { name: string; label: string; description: string; order?: string; desc?: boolean };

const TABLES: TableDef[] = [
  { name: "profiles", label: "profiles", description: "Every member: name, User ID, mobile, email, DOB, photo, address, sponsor & tree position, KYC, account status, login password.", order: "created_at", desc: true },
  { name: "user_roles", label: "user_roles", description: "Which account is an admin and which is a member." },
  { name: "products", label: "products", description: "Product catalogue: name, category, image, MRP, direct commission, pair bonus, stock, status.", order: "created_at" },
  { name: "orders", label: "orders", description: "Every purchase: member, product, quantity, amount, payment reference & screenshot, full delivery address, approval status.", order: "created_at", desc: true },
  { name: "commissions", label: "commissions", description: "Every income entry credited: direct, pair and reward payouts with source member and order.", order: "created_at", desc: true },
  { name: "wallets", label: "wallets", description: "Per-member balance, total earned, direct income and pair income." },
  { name: "tree_stats", label: "tree_stats", description: "Binary tree counters: left count, right count, matched pairs, pairs used today." },
  { name: "reward_levels", label: "reward_levels", description: "The 18 reward levels: pairs required and reward amount.", order: "level" },
  { name: "user_rewards", label: "user_rewards", description: "Rewards unlocked by each member with claim deadline, claimed and expired state.", order: "created_at", desc: true },
  { name: "withdrawals", label: "withdrawals", description: "Withdrawal requests: amount, TDS, net payable, UPI ID, approval status.", order: "created_at", desc: true },
  { name: "plan_settings", label: "plan_settings", description: "Business settings: UPI ID, QR image, minimum withdrawal, TDS %, daily pair cap, refund days." },
];

function typeOf(value: unknown): string {
  if (value === null || value === undefined) return "empty";
  if (typeof value === "boolean") return "true / false";
  if (typeof value === "number") return "number";
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) return "date & time";
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return "date";
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-/.test(value)) return "unique id";
    return "text";
  }
  return "data";
}

export default function DatabaseConsole() {
  const [active, setActive] = useState<string>("profiles");
  const [data, setData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [view, setView] = useState<"rows" | "structure">("rows");

  async function load() {
    setLoading(true);
    const results = await Promise.all(
      TABLES.map(async (t) => {
        let query = supabase.from(t.name as any).select("*");
        if (t.order) query = query.order(t.order, { ascending: !t.desc });
        const { data: rows } = await query.limit(1000);
        return [t.name, rows || []] as const;
      }),
    );
    setData(Object.fromEntries(results));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const def = TABLES.find(t => t.name === active)!;
  const rows = data[active] || [];
  const cols = useMemo(() => (rows.length ? Object.keys(rows[0]) : []), [rows]);
  const filtered = useMemo(() => (
    q.trim() ? rows.filter(r => JSON.stringify(r).toLowerCase().includes(q.trim().toLowerCase())) : rows
  ), [rows, q]);

  function exportCsv() {
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(","), ...filtered.map(r => cols.map(c => esc(r[c])).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${active}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalRows = TABLES.reduce((s, t) => s + (data[t.name]?.length || 0), 0);

  return (
    <div className="rounded-2xl border border-border bg-card shadow-elegant overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h2 className="font-serif text-xl text-primary">Database</h2>
          <p className="text-xs text-muted-foreground">
            {TABLES.length} tables · {totalRows} rows stored · live data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="inline-flex items-center gap-1.5 rounded-full border border-input px-4 py-1.5 text-xs font-semibold">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-full bg-gradient-gold px-4 py-1.5 text-xs font-semibold text-gold-foreground">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        <aside className="lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-border max-h-[240px] lg:max-h-none overflow-y-auto">
          {TABLES.map(t => (
            <button
              key={t.name}
              onClick={() => { setActive(t.name); setQ(""); }}
              className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left text-xs border-b border-border/50 ${active === t.name ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-muted/50"}`}
            >
              <span className="inline-flex items-center gap-2 truncate">
                <Table2 className="h-3.5 w-3.5 shrink-0" /> {t.label}
              </span>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] ${active === t.name ? "bg-primary-foreground/20" : "bg-muted"}`}>
                {data[t.name]?.length ?? "…"}
              </span>
            </button>
          ))}
        </aside>

        <section className="flex-1 min-w-0 p-5">
          <p className="text-xs text-muted-foreground mb-3">{def.description}</p>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="inline-flex rounded-full border border-input p-0.5 text-xs">
              {(["rows", "structure"] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`rounded-full px-3 py-1 capitalize ${view === v ? "bg-primary text-primary-foreground font-semibold" : ""}`}>
                  {v === "rows" ? "Data" : "Columns"}
                </button>
              ))}
            </div>
            {view === "rows" && (
              <input value={q} onChange={e => setQ(e.target.value)} placeholder={`Search in ${def.label}...`}
                className="rounded-full border border-input bg-background px-4 py-1.5 text-xs flex-1 min-w-[180px]" />
            )}
            <span className="text-[11px] text-muted-foreground">{filtered.length} row(s)</span>
          </div>

          {loading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Loading data…</p>
          ) : view === "structure" ? (
            cols.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">No rows yet, so columns cannot be listed.</p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-[10px] uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 px-2">Column</th>
                    <th className="py-2 px-2">Kind of value</th>
                    <th className="py-2 px-2">Example</th>
                  </tr>
                </thead>
                <tbody>
                  {cols.map(c => {
                    const sample = rows.find(r => r[c] !== null && r[c] !== undefined)?.[c];
                    return (
                      <tr key={c} className="border-b border-border/50">
                        <td className="py-2 px-2 font-medium">{c}</td>
                        <td className="py-2 px-2 text-muted-foreground">{typeOf(sample)}</td>
                        <td className="py-2 px-2 max-w-[320px] truncate text-muted-foreground">{String(sample ?? "—")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
          ) : filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No rows stored in this table yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {cols.map(c => (
                      <th key={c} className="py-2 px-2 whitespace-nowrap uppercase tracking-wide text-[10px] text-muted-foreground">{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.id || i} className="border-b border-border/50 hover:bg-muted/40 align-top">
                      {cols.map(c => (
                        <td key={c} className="py-2 px-2 max-w-[240px] truncate" title={String(r[c] ?? "")}>
                          {r[c] === null || r[c] === undefined ? <span className="text-muted-foreground">null</span> : String(r[c])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
