import { useState } from "react";
import { BarChart3, TrendingUp, Users, Package, DollarSign } from "lucide-react";
import {
  useKPIs,
  useTopProducts,
  useTopClients,
  useSalesChart,
  usePaymentBreakdown,
} from "@/hooks/useAnalytics";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { formatPrice, formatNumber } from "@/lib/utils";

// Mini bar chart with terracotta gradient
function BarChart({ data }: { data: { periode: string; montant: number }[] }) {
  if (!data.length)
    return (
      <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">
        Aucune donnée disponible
      </div>
    );
  const max = Math.max(...data.map((d) => d.montant), 1);
  return (
    <div className="flex items-end gap-1 h-44 mt-3">
      {data.map((point, i) => {
        const heightPct = Math.max(4, (point.montant / max) * 100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div
              className="w-full rounded-t-lg transition-all cursor-default relative hover:brightness-110"
              style={{
                height: `${heightPct}%`,
                background: `linear-gradient(to top, var(--sama-terra), rgba(196,98,45,0.4))`,
                opacity: 0.7 + (heightPct / 100) * 0.3,
              }}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-foreground text-background text-[10px] px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                {formatPrice(point.montant)}
              </div>
            </div>
            <span className="text-[9px] text-muted-foreground truncate w-full text-center">
              {point.periode}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const KPI_CONFIG = [
  {
    key: "caMois",
    label: "CA du mois",
    icon: DollarSign,
    color: "var(--sama-terra)",
    bg: "var(--sama-terra-light)",
    format: (v: number) => formatPrice(v),
  },
  {
    key: "caSemaine",
    label: "CA semaine",
    icon: TrendingUp,
    color: "var(--sama-green)",
    bg: "rgba(45,196,122,0.1)",
    format: (v: number) => formatPrice(v),
  },
  {
    key: "nbClientsActifs",
    label: "Clients actifs",
    icon: Users,
    color: "var(--sama-blue)",
    bg: "rgba(45,107,196,0.1)",
    format: (v: number) => formatNumber(v),
  },
  {
    key: "produitsEnRupture",
    label: "En rupture",
    icon: Package,
    color: "rgb(239,68,68)",
    bg: "rgba(239,68,68,0.1)",
    format: (v: number) => formatNumber(v),
  },
];

export default function Analytics() {
  const [periode, setPeriode] = useState<"daily" | "monthly">("daily");
  const { data: kpis, isLoading: kpisLoading } = useKPIs();
  const { data: topProducts = [] } = useTopProducts({ top: 10 });
  const { data: topClients = [] } = useTopClients({ top: 10 });
  const { data: chartData = [], isLoading: chartLoading } = useSalesChart({ periode });
  const { data: payments = [] } = usePaymentBreakdown();

  return (
    <div className="p-6 space-y-6">
      <PageHeader icon={BarChart3} title="Analytiques" description="Analyse détaillée de votre activité" />

      {/* KPI cards */}
      {kpisLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} variant="card" />)}
        </div>
      ) : kpis ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI_CONFIG.map(({ key, label, icon: Icon, color, bg, format }) => (
            <div key={key} className="bg-card rounded-2xl border border-border/50 shadow-sm p-5 overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: color }} />
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 mt-1" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <p
                className="text-2xl font-bold text-foreground"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {format((kpis as Record<string, number>)[key] ?? 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      ) : null}

      {/* Sales chart */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 rounded-full" style={{ background: "var(--sama-terra)" }} />
            <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Évolution des ventes
            </h3>
          </div>
          <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
            {(["daily", "monthly"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriode(p)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={
                  periode === p
                    ? { background: "var(--sama-terra)", color: "white" }
                    : { color: "var(--muted-foreground)" }
                }
              >
                {p === "daily" ? "Journalier" : "Mensuel"}
              </button>
            ))}
          </div>
        </div>
        <div className="px-5 pb-5">
          {chartLoading ? <LoadingSkeleton variant="card" /> : <BarChart data={chartData} />}
        </div>
      </div>

      {/* Bottom row: top products + clients + payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Top products */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
            <div className="w-1 h-5 rounded-full" style={{ background: "var(--sama-terra)" }} />
            <h3 className="text-sm font-semibold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Top produits
            </h3>
          </div>
          <div className="p-5">
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Aucune donnée</p>
            ) : (
              <ul className="space-y-3.5">
                {topProducts.map((p, i) => (
                  <li key={p.id} className="flex items-center gap-2.5 text-sm">
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                      style={{ background: "var(--sama-terra-light)", color: "var(--sama-terra)" }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate text-xs">{p.nom}</p>
                      <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(p.qtéVendue / (topProducts[0]?.qtéVendue || 1)) * 100}%`,
                            background: "var(--sama-terra)",
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0 font-semibold">
                      {p.qtéVendue}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Top clients */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
            <div className="w-1 h-5 rounded-full" style={{ background: "var(--sama-gold)" }} />
            <h3 className="text-sm font-semibold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Top clients
            </h3>
          </div>
          <div className="p-5">
            {topClients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Aucune donnée</p>
            ) : (
              <ul className="space-y-3.5">
                {topClients.map((c, i) => (
                  <li key={c.id} className="flex items-center gap-2.5 text-sm">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: "var(--sama-terra-light)", color: "var(--sama-terra)" }}
                    >
                      {c.nom[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-foreground truncate">{c.nom}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(c.totalDepense)}</p>
                    </div>
                    <span className="text-xs text-muted-foreground font-semibold">{c.nbAchats} cmd</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Payment breakdown */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
            <div className="w-1 h-5 rounded-full" style={{ background: "var(--sama-green)" }} />
            <h3 className="text-sm font-semibold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Répartition paiements
            </h3>
          </div>
          <div className="p-5">
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Aucune donnée</p>
            ) : (
              <ul className="space-y-4">
                {payments.map((p, i) => {
                  const colors = ["var(--sama-terra)", "var(--sama-gold)", "var(--sama-green)", "var(--sama-blue)"];
                  const color = colors[i % colors.length];
                  return (
                    <li key={p.modePaiement}>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-foreground">{p.modePaiement}</span>
                        <span className="font-bold" style={{ color }}>{p.pourcentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${p.pourcentage}%`, background: color }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
