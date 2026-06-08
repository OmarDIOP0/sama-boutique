import {
    TrendingUp, TrendingDown, ShoppingCart, Users, Package,
    AlertTriangle, ArrowRight, Banknote, ShoppingBag, Minus,
    Plus, Warehouse, FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useKPIs, useTopProducts, useTopClients, useSalesChart } from "@/hooks/useAnalytics";
import { useStockAlerts } from "@/hooks/useProducts";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { formatPrice, cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";

const DARK = "#513102";
const GOLD = "#C7932D";

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ title, value, icon: Icon, trend, trendLabel, accent, to }: {
    title: string; value: string | number; icon: React.ElementType;
    trend?: number; trendLabel?: string; accent: string; to: string;
}) {
    const TrendIcon = trend == null ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
    const pos = trend != null && trend > 0;
    const neutral = trend === 0;

    return (
        <Link to={to} className="admin-card overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md group" style={{ cursor: "pointer" }}>
            <div className="h-1 w-full" style={{ background: accent }} />
            <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                    <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(81,49,2,0.50)" }}>{title}</p>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${accent}1A` }}>
                        <Icon className="w-5 h-5" style={{ color: accent }} />
                    </div>
                </div>
                <p style={{ fontSize: 32, fontWeight: 800, color: DARK, fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.1 }}>
                    {value}
                </p>
                {(trend != null || trendLabel) && (
                    <div className="mt-2.5 flex items-center gap-1.5">
                        {trend != null && TrendIcon && (
                            <>
                                <TrendIcon className="w-3.5 h-3.5" style={{ color: neutral ? "rgba(81,49,2,0.40)" : pos ? "#2D7A4F" : "#DC2626" }} />
                                <span style={{ fontSize: 12.5, fontWeight: 600, color: neutral ? "rgba(81,49,2,0.40)" : pos ? "#2D7A4F" : "#DC2626" }}>
                                    {trend > 0 ? "+" : ""}{trend.toFixed(1)}%
                                </span>
                            </>
                        )}
                        {trendLabel && <span style={{ fontSize: 12, color: "rgba(81,49,2,0.45)" }}>{trendLabel}</span>}
                    </div>
                )}
            </div>
        </Link>
    );
}

// ── Tooltip personnalisé du graphique ─────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    return (
        <div className="admin-card px-3 py-2" style={{ boxShadow: "0 8px 24px rgba(81,49,2,0.15)" }}>
            <p style={{ fontSize: 11, color: "rgba(81,49,2,0.55)" }}>{label}</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>{formatPrice(payload[0].value)}</p>
        </div>
    );
}

// ── Section card ──────────────────────────────────────────────────────────────
function SectionCard({ title, to, toLabel = "Voir tout", children }: {
    title: string; to?: string; toLabel?: string; children: React.ReactNode;
}) {
    return (
        <div className="admin-card p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{title}</h3>
                {to && (
                    <Link to={to} className="flex items-center gap-1 hover:opacity-75 transition-opacity" style={{ fontSize: 12.5, fontWeight: 600, color: GOLD }}>
                        {toLabel} <ArrowRight className="w-3 h-3" />
                    </Link>
                )}
            </div>
            {children}
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

    const chartFormatted = chartData.map((d) => ({
        periode: d.periode,
        montant: d.montant,
    }));

    const shortcuts = [
        { to: "/admin/pos", icon: ShoppingCart, label: "Nouvelle vente", color: GOLD },
        { to: "/admin/products/new", icon: Plus, label: "Nouveau produit", color: "#2563EB" },
        { to: "/admin/stock", icon: Warehouse, label: "Mouvement stock", color: "#2D7A4F" },
        { to: "/admin/analytics", icon: FileText, label: "Rapports", color: "#A855F7" },
    ];

    return (
        <div className="p-6 lg:p-8 space-y-6 max-w-[1600px]">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: DARK, fontFamily: "'Playfair Display', Georgia, serif" }}>
                        {greeting}, {user?.nom?.split(" ")[0]} 👋
                    </h1>
                    <p style={{ fontSize: 14, color: "rgba(81,49,2,0.55)", marginTop: 2 }}>
                        Voici un aperçu de votre activité
                    </p>
                </div>
                <Link to="/admin/pos" className="admin-btn-gold">
                    <ShoppingCart className="w-4 h-4" />
                    Nouvelle vente
                </Link>
            </div>

            {/* KPI Cards */}
            {kpisLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} variant="card" />)}
                </div>
            ) : kpis ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <KpiCard title="CA du jour" value={formatPrice(kpis.caJour)} icon={Banknote} trend={kpis.evolutionCaPct} trendLabel="vs hier" accent={GOLD} to="/admin/sales" />
                    <KpiCard title="CA du mois" value={formatPrice(kpis.caMois)} icon={TrendingUp} accent="#2D7A4F" to="/admin/analytics" />
                    <KpiCard title="Commandes (mois)" value={kpis.nbVentesMois} icon={ShoppingBag} trend={kpis.evolutionVentesPct} trendLabel="vs hier" accent="#2563EB" to="/admin/orders" />
                    <KpiCard title="Clients actifs" value={kpis.nbClientsActifs} icon={Users} accent="#A855F7" to="/admin/clients" />
                </div>
            ) : null}

            {/* Chart + Stock alerts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Sales chart */}
                <div className="xl:col-span-2 admin-card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: DARK }}>Ventes — 30 derniers jours</h3>
                        <Link to="/admin/analytics" className="flex items-center gap-1 hover:opacity-75" style={{ fontSize: 12.5, fontWeight: 600, color: GOLD }}>
                            Voir tout <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {chartFormatted.length > 0 ? (
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={chartFormatted} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="caGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={GOLD} stopOpacity={0.30} />
                                        <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(81,49,2,0.06)" vertical={false} />
                                <XAxis dataKey="periode" tick={{ fontSize: 11, fill: "rgba(81,49,2,0.45)" }} axisLine={false} tickLine={false} minTickGap={24} />
                                <YAxis tick={{ fontSize: 11, fill: "rgba(81,49,2,0.45)" }} axisLine={false} tickLine={false} width={48}
                                    tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
                                <Tooltip content={<ChartTooltip />} />
                                <Area type="monotone" dataKey="montant" stroke={GOLD} strokeWidth={2.5} fill="url(#caGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[240px] flex items-center justify-center" style={{ fontSize: 14, color: "rgba(81,49,2,0.45)" }}>
                            Données insuffisantes
                        </div>
                    )}
                </div>

                {/* Stock alerts */}
                <div className="admin-card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="flex items-center gap-2" style={{ fontSize: 15, fontWeight: 700, color: DARK }}>
                            Alertes stock
                            {alerts.length > 0 && (
                                <span className="text-white text-[10px] font-bold rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center" style={{ background: "#DC2626" }}>
                                    {alerts.length}
                                </span>
                            )}
                        </h3>
                        <Link to="/admin/stock" className="flex items-center gap-1 hover:opacity-75" style={{ fontSize: 12.5, fontWeight: 600, color: GOLD }}>
                            Gérer <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                    {alerts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-center">
                            <Package className="w-7 h-7 mb-2" style={{ color: "#2D7A4F" }} />
                            <p style={{ fontSize: 13, color: "rgba(81,49,2,0.55)" }}>Tous les stocks sont OK</p>
                        </div>
                    ) : (
                        <ul className="space-y-2.5">
                            {alerts.slice(0, 5).map((alert, i) => {
                                const rupture = alert.stockActuel === 0;
                                return (
                                    <li key={i} className="flex items-center justify-between gap-2 p-2.5 rounded-xl" style={{ background: "rgba(199,147,45,0.05)" }}>
                                        <div className="flex items-center gap-2 min-w-0">
                                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: rupture ? "#DC2626" : GOLD }} />
                                            <span className="truncate" style={{ fontSize: 13, fontWeight: 500, color: DARK }}>{alert.productNom}</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span style={{ fontSize: 12, fontWeight: 700, color: rupture ? "#DC2626" : GOLD }}>
                                                {alert.stockActuel} u.
                                            </span>
                                            <Link to="/admin/stock" className="px-2 py-1 rounded-lg text-[11px] font-semibold transition-colors"
                                                style={{ background: "rgba(199,147,45,0.15)", color: GOLD }}>
                                                Réappro
                                            </Link>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>

            {/* Shortcuts */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {shortcuts.map((s) => (
                    <Link key={s.to} to={s.to} className="admin-card p-5 flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ cursor: "pointer" }}>
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}1A` }}>
                            <s.icon className="w-5 h-5" style={{ color: s.color }} />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{s.label}</span>
                    </Link>
                ))}
            </div>

            {/* Top products + clients */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <SectionCard title="Top 5 Produits" to="/admin/analytics">
                    {productsLoading ? (
                        <LoadingSkeleton variant="text" rows={5} />
                    ) : topProducts.length === 0 ? (
                        <p className="text-center py-6" style={{ fontSize: 13, color: "rgba(81,49,2,0.45)" }}>Aucune donnée</p>
                    ) : (
                        <ul className="space-y-3">
                            {topProducts.map((p, i) => (
                                <li key={p.id} className="flex items-center gap-3">
                                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[12px] font-bold flex-shrink-0"
                                        style={{ background: i === 0 ? "rgba(199,147,45,0.18)" : "rgba(81,49,2,0.05)", color: i === 0 ? GOLD : "rgba(81,49,2,0.50)" }}>
                                        {i + 1}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate" style={{ fontSize: 13.5, fontWeight: 500, color: DARK }}>{p.nom}</p>
                                        <p style={{ fontSize: 12, color: "rgba(81,49,2,0.50)" }}>{p.qtéVendue} vendu{p.qtéVendue > 1 ? "s" : ""}</p>
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>{formatPrice(p.caGenere)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </SectionCard>

                <SectionCard title="Top 5 Clients" to="/admin/clients">
                    {clientsLoading ? (
                        <LoadingSkeleton variant="text" rows={5} />
                    ) : topClients.length === 0 ? (
                        <p className="text-center py-6" style={{ fontSize: 13, color: "rgba(81,49,2,0.45)" }}>Aucune donnée</p>
                    ) : (
                        <ul className="space-y-3">
                            {topClients.map((c) => (
                                <li key={c.id} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(199,147,45,0.12)" }}>
                                        <span style={{ fontSize: 12, fontWeight: 700, color: GOLD }}>{c.nom[0]?.toUpperCase()}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate" style={{ fontSize: 13.5, fontWeight: 500, color: DARK }}>{c.nom}</p>
                                        <p style={{ fontSize: 12, color: "rgba(81,49,2,0.50)" }}>{c.nbAchats} achat{c.nbAchats > 1 ? "s" : ""}</p>
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>{formatPrice(c.totalDepense)}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </SectionCard>
            </div>
        </div>
    );
}
