import { useState } from "react";
import { BarChart3, TrendingUp, Users, Package, Banknote } from "lucide-react";
import {
  AreaChart, Area, BarChart as RBarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  useKPIs, useTopProducts, useTopClients, useSalesChart, usePaymentBreakdown,
} from "@/hooks/useAnalytics";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { AdminPageHeader } from "@/components/admin/ui";
import { formatPrice, formatNumber } from "@/lib/utils";

const GOLD = "#C7932D";
const DARK = "#513102";
const PALETTE = ["#C7932D", "#2D7A4F", "#2563EB", "#A855F7", "#DC2626", "#D4A574"];

function ChartTooltip({ active, payload, label, money = true }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="admin-card px-3 py-2" style={{ boxShadow: "0 8px 24px rgba(81,49,2,0.15)" }}>
      <p style={{ fontSize: 11, color: "rgba(81,49,2,0.55)" }}>{label ?? payload[0].name}</p>
      <p style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>
        {money ? formatPrice(payload[0].value) : payload[0].value}
      </p>
    </div>
  );
}

const KPI_CONFIG = [
  { key: "caMois", label: "CA du mois", icon: Banknote, color: GOLD, fmt: (v: number) => formatPrice(v) },
  { key: "caSemaine", label: "CA semaine", icon: TrendingUp, color: "#2D7A4F", fmt: (v: number) => formatPrice(v) },
  { key: "nbClientsActifs", label: "Clients actifs", icon: Users, color: "#2563EB", fmt: (v: number) => formatNumber(v) },
  { key: "produitsEnRupture", label: "En rupture", icon: Package, color: "#DC2626", fmt: (v: number) => formatNumber(v) },
];

function SectionCard({ title, accent = GOLD, children, action }: { title: string; accent?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="admin-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(81,49,2,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-5 rounded-full" style={{ background: accent }} />
          <h3 style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function Analytics() {
  const [periode, setPeriode] = useState<"daily" | "monthly">("daily");
  const { data: kpis, isLoading: kpisLoading } = useKPIs();
  const { data: topProducts = [] } = useTopProducts({ top: 8 });
  const { data: topClients = [] } = useTopClients({ top: 8 });
  const { data: chartData = [], isLoading: chartLoading } = useSalesChart({ periode });
  const { data: payments = [] } = usePaymentBreakdown();

  const barData = topProducts.map((p) => ({ nom: p.nom.length > 16 ? p.nom.slice(0, 16) + "…" : p.nom, qte: p.qtéVendue }));
  const pieData = payments.map((p) => ({ name: p.modePaiement, value: p.pourcentage }));

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1600px]">
      <AdminPageHeader icon={BarChart3} iconColor="blue" title="Analytiques" subtitle="Analyse détaillée de votre activité" />

      {/* KPI cards */}
      {kpisLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} variant="card" />)}
        </div>
      ) : kpis ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI_CONFIG.map(({ key, label, icon: Icon, color, fmt }) => (
            <div key={key} className="admin-card overflow-hidden">
              <div className="h-1 w-full" style={{ background: color }} />
              <div className="p-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${color}1A` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <p style={{ fontSize: 28, fontWeight: 800, color: DARK, fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {fmt((kpis as Record<string, number>)[key] ?? 0)}
                </p>
                <p style={{ fontSize: 12.5, color: "rgba(81,49,2,0.50)", marginTop: 2 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Sales evolution */}
      <SectionCard
        title="Évolution des ventes"
        action={
          <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: "rgba(81,49,2,0.05)" }}>
            {(["daily", "monthly"] as const).map((p) => (
              <button key={p} onClick={() => setPeriode(p)} className="px-3.5 py-1.5 rounded-lg transition-all"
                style={periode === p ? { background: GOLD, color: "white", fontSize: 12.5, fontWeight: 600, cursor: "pointer" } : { color: "rgba(81,49,2,0.55)", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                {p === "daily" ? "Journalier" : "Mensuel"}
              </button>
            ))}
          </div>
        }
      >
        {chartLoading ? <LoadingSkeleton variant="card" /> : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="anaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD} stopOpacity={0.30} />
                  <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(81,49,2,0.06)" vertical={false} />
              <XAxis dataKey="periode" tick={{ fontSize: 11, fill: "rgba(81,49,2,0.45)" }} axisLine={false} tickLine={false} minTickGap={24} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(81,49,2,0.45)" }} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="montant" stroke={GOLD} strokeWidth={2.5} fill="url(#anaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center" style={{ fontSize: 14, color: "rgba(81,49,2,0.45)" }}>Aucune donnée</div>
        )}
      </SectionCard>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top products — horizontal bar */}
        <SectionCard title="Top produits" accent={GOLD}>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={Math.max(220, barData.length * 38)}>
              <RBarChart data={barData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(81,49,2,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "rgba(81,49,2,0.45)" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="nom" tick={{ fontSize: 11, fill: "rgba(81,49,2,0.55)" }} axisLine={false} tickLine={false} width={110} />
                <Tooltip content={<ChartTooltip money={false} />} cursor={{ fill: "rgba(199,147,45,0.06)" }} />
                <Bar dataKey="qte" fill={GOLD} radius={[0, 6, 6, 0]} barSize={18} />
              </RBarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-10" style={{ fontSize: 14, color: "rgba(81,49,2,0.45)" }}>Aucune donnée</p>
          )}
        </SectionCard>

        {/* Payment breakdown — donut */}
        <SectionCard title="Répartition paiements" accent="#2D7A4F">
          {pieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
                  </Pie>
                  <Tooltip content={<ChartTooltip money={false} />} />
                </PieChart>
              </ResponsiveContainer>
              <ul className="flex-1 space-y-2.5">
                {payments.map((p, i) => (
                  <li key={p.modePaiement} className="flex items-center justify-between">
                    <span className="flex items-center gap-2" style={{ fontSize: 13, fontWeight: 500, color: DARK }}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} />
                      {p.modePaiement}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: PALETTE[i % PALETTE.length] }}>{p.pourcentage.toFixed(1)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-center py-10" style={{ fontSize: 14, color: "rgba(81,49,2,0.45)" }}>Aucune donnée</p>
          )}
        </SectionCard>
      </div>

      {/* Top clients */}
      <SectionCard title="Top clients" accent="#A855F7">
        {topClients.length === 0 ? (
          <p className="text-center py-8" style={{ fontSize: 14, color: "rgba(81,49,2,0.45)" }}>Aucune donnée</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {topClients.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(81,49,2,0.05)" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${PALETTE[i % PALETTE.length]}1A`, color: PALETTE[i % PALETTE.length], fontSize: 14, fontWeight: 700 }}>
                  {c.nom[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate" style={{ fontSize: 13.5, fontWeight: 600, color: DARK }}>{c.nom}</p>
                  <p style={{ fontSize: 12, color: GOLD, fontWeight: 600 }}>{formatPrice(c.totalDepense)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
