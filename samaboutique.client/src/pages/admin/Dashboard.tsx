import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  Banknote,
  BarChart2,
  Minus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useKPIs, useTopProducts, useTopClients, useSalesChart } from "@/hooks/useAnalytics";
import { useStockAlerts } from "@/hooks/useProducts";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

// Simple sparkline bar chart
function MiniChart({ data }: { data: { periode: string; montant: number }[] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.montant), 1);
  return (
    <div className="flex items-end gap-0.5 h-16">
      {data.slice(-14).map((point, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-colors cursor-default"
          style={{
            height: `${Math.max(4, (point.montant / max) * 100)}%`,
            background: "var(--sama-terra)",
            opacity: 0.25 + (i / data.slice(-14).length) * 0.75,
          }}
          title={`${point.periode}: ${formatPrice(point.montant)}`}
        />
      ))}
    </div>
  );
}

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  accentColor: string;
  subtitle?: string;
}

function KpiCard({ title, value, icon: Icon, trend, trendLabel, accentColor, subtitle }: KpiCardProps) {
  const TrendIcon = trend == null ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendPositive = trend != null && trend > 0;
  const trendNeutral = trend === 0;

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:shadow-md transition-shadow">
      {/* Colored top bar */}
      <div className="h-1 w-full" style={{ background: accentColor }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${accentColor}15` }}>
            <Icon className="w-4 h-4" style={{ color: accentColor }} />
          </div>
        </div>
        <p
          className="text-3xl font-bold text-foreground count-anim"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {value}
        </p>
        {(trend != null || subtitle) && (
          <div className="mt-2 flex items-center gap-1.5">
            {trend != null && TrendIcon && (
              <>
                <TrendIcon
                  className={cn(
                    "w-3.5 h-3.5",
                    trendNeutral
                      ? "text-muted-foreground"
                      : trendPositive
                      ? "text-success"
                      : "text-danger"
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium",
                    trendNeutral
                      ? "text-muted-foreground"
                      : trendPositive
                      ? "text-success"
                      : "text-danger"
                  )}
                >
                  {trend > 0 ? "+" : ""}{trend.toFixed(1)}%
                </span>
                {trendLabel && (
                  <span className="text-xs text-muted-foreground">{trendLabel}</span>
                )}
              </>
            )}
            {subtitle && !trend && (
              <span className="text-xs text-muted-foreground">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const { data: kpis, isLoading: kpisLoading } = useKPIs();
  const { data: topProducts = [], isLoading: productsLoading } = useTopProducts({ top: 5 });
  const { data: topClients = [], isLoading: clientsLoading } = useTopClients({ top: 5 });
  const { data: chartData = [] } = useSalesChart({ periode: "daily" });
  const { data: alerts = [] } = useStockAlerts();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div className="p-6 space-y-6 max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {greeting}, {user?.nom?.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Voici un aperçu de votre activité aujourd'hui
          </p>
        </div>
        <Link
          to="/admin/pos"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold hover:opacity-90 btn-lift transition-all"
          style={{ background: "var(--sama-terra)" }}
        >
          <ShoppingCart className="w-4 h-4" />
          Nouvelle vente
        </Link>
      </div>

      {/* KPI Cards */}
      {kpisLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <LoadingSkeleton key={i} variant="card" />
          ))}
        </div>
      ) : kpis ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            title="CA du jour"
            value={formatPrice(kpis.caJour)}
            icon={Banknote}
            trend={kpis.evolutionCaPct}
            trendLabel="vs hier"
            accentColor="var(--sama-terra)"
          />
          <KpiCard
            title="Ventes du jour"
            value={kpis.nbVentesJour}
            icon={ShoppingCart}
            trend={kpis.evolutionVentesPct}
            trendLabel="vs hier"
            accentColor="var(--sama-blue)"
          />
          <KpiCard
            title="Panier moyen"
            value={formatPrice(kpis.panierMoyen)}
            icon={BarChart2}
            accentColor="var(--sama-green)"
          />
          <KpiCard
            title="Clients actifs"
            value={kpis.nbClientsActifs}
            icon={Users}
            accentColor="var(--sama-gold)"
            subtitle={
              kpis.produitsEnRupture > 0
                ? `${kpis.produitsEnRupture} produit(s) en rupture`
                : undefined
            }
          />
        </div>
      ) : null}

      {/* Chart + Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Sales chart */}
        <div className="xl:col-span-2 bg-card rounded-2xl border border-border/50 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Ventes — 14 derniers jours
            </h3>
            <Link
              to="/admin/analytics"
              className="text-xs hover:underline flex items-center gap-1"
              style={{ color: "var(--sama-terra)" }}
            >
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {chartData.length > 0 ? (
            <>
              <MiniChart data={chartData} />
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span>CA total : {formatPrice(chartData.reduce((s, d) => s + d.montant, 0))}</span>
                <span>{chartData.length} jours</span>
              </div>
            </>
          ) : (
            <div className="h-16 flex items-center justify-center text-sm text-muted-foreground">
              Données insuffisantes
            </div>
          )}
        </div>

        {/* Stock alerts */}
        <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              Alertes stock
              {alerts.length > 0 && (
                <span className="bg-danger text-white text-[10px] font-bold rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center">
                  {alerts.length}
                </span>
              )}
            </h3>
            <Link
              to="/admin/stock"
              className="text-xs hover:underline flex items-center gap-1"
              style={{ color: "var(--sama-terra)" }}
            >
              Gérer <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-20 text-center">
              <Package className="w-6 h-6 text-success mb-2" />
              <p className="text-xs text-muted-foreground">Tous les stocks sont OK</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {alerts.slice(0, 5).map((alert, i) => (
                <li key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle className="w-3 h-3 text-danger flex-shrink-0" />
                    <span className="truncate text-foreground">{alert.productNom}</span>
                  </div>
                  <span className="font-semibold text-danger ml-2 flex-shrink-0">
                    {alert.stockActuel} unité{alert.stockActuel > 1 ? "s" : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Top products + Top clients */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Top products */}
        <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Top 5 Produits</h3>
            <Link
              to="/admin/analytics"
              className="text-xs hover:underline flex items-center gap-1"
              style={{ color: "var(--sama-terra)" }}
            >
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {productsLoading ? (
            <LoadingSkeleton variant="text" rows={5} />
          ) : topProducts.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">Aucune donnée</p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0",
                    )}
                    style={{
                      background: i === 0 ? "rgba(196,168,45,0.15)" : i === 1 ? "rgba(170,170,170,0.15)" : "rgba(0,0,0,0.05)",
                      color: i === 0 ? "var(--sama-gold)" : i === 1 ? "#888" : "#aaa",
                    }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{p.nom}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {p.qtéVendue} vendu{p.qtéVendue > 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-foreground flex-shrink-0">
                    {formatPrice(p.caGenere)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top clients */}
        <div className="bg-card rounded-2xl border border-border/50 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Top 5 Clients</h3>
            <Link
              to="/admin/clients"
              className="text-xs hover:underline flex items-center gap-1"
              style={{ color: "var(--sama-terra)" }}
            >
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {clientsLoading ? (
            <LoadingSkeleton variant="text" rows={5} />
          ) : topClients.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">Aucune donnée</p>
          ) : (
            <ul className="space-y-3">
              {topClients.map((c, i) => (
                <li key={c.id} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--sama-terra-light)" }}>
                    <span className="text-[10px] font-bold" style={{ color: "var(--sama-terra)" }}>
                      {c.nom[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{c.nom}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {c.nbAchats} achat{c.nbAchats > 1 ? "s" : ""}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-foreground flex-shrink-0">
                    {formatPrice(c.totalDepense)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
