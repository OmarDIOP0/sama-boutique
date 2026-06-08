import { useState, useMemo } from "react";
import { Receipt, Package, CreditCard, User, Calendar, Ban, Banknote, ShoppingCart, BarChart3, PieChart } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { useSales, useCancelSale } from "@/hooks/useSales";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { AdminPageHeader, AdminDrawer, AdminConfirmDialog, AdminStatusBadge, AdminExportButtons } from "@/components/admin/ui";
import { exportToCSV, exportToPDF, type ExportColumn } from "@/lib/export";
import { formatPrice, formatDateTime } from "@/lib/utils";
import type { Sale } from "@/types";

const GOLD = "#C7932D";
const DARK = "#513102";

// ── Configuration des parts (modifiable) ──────────────────────────────────────
const WAVE_FEE_PCT = 1;      // Wave prélève 1% par transaction Mobile Money
const DEV_SHARE_PCT = 20;    // Part développeur sur le CA net (%)
// → Part boutique = 100 - DEV_SHARE_PCT

// ── Périodes de filtrage ──────────────────────────────────────────────────────
type PeriodKey = "today" | "7d" | "30d" | "year" | "all";
const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "today", label: "Aujourd'hui" },
  { key: "7d", label: "7 jours" },
  { key: "30d", label: "30 jours" },
  { key: "year", label: "Cette année" },
  { key: "all", label: "Tout" },
];
function periodRange(key: PeriodKey): { from?: string; to?: string } {
  const now = new Date();
  const to = new Date(now); to.setHours(23, 59, 59, 999);
  const from = new Date(now); from.setHours(0, 0, 0, 0);
  switch (key) {
    case "today": return { from: from.toISOString(), to: to.toISOString() };
    case "7d": from.setDate(from.getDate() - 6); return { from: from.toISOString(), to: to.toISOString() };
    case "30d": from.setDate(from.getDate() - 29); return { from: from.toISOString(), to: to.toISOString() };
    case "year": return { from: new Date(now.getFullYear(), 0, 1).toISOString(), to: to.toISOString() };
    case "all": return {};
  }
}

const PAYMENT_METHODS = ["MobileMoney", "Espèces", "Carte", "Mixte", "Crédit"];

function StatCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent: string }) {
  return (
    <div className="admin-card p-5 flex items-center gap-3.5">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}1A` }}>
        <Icon className="w-6 h-6" style={{ color: accent }} />
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(81,49,2,0.50)" }}>{label}</p>
        <p style={{ fontSize: 24, fontWeight: 800, color: DARK, fontFamily: "'Playfair Display', Georgia, serif" }}>{value}</p>
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="admin-card px-3 py-2" style={{ boxShadow: "0 8px 24px rgba(81,49,2,0.15)" }}>
      <p style={{ fontSize: 11, color: "rgba(81,49,2,0.55)" }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>{formatPrice(payload[0].value)}</p>
    </div>
  );
}

export default function Sales() {
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState<PeriodKey>("30d");
  const [modePaiement, setModePaiement] = useState("");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Sale | null>(null);

  const range = useMemo(() => periodRange(period), [period]);
  const filters = { from: range.from, to: range.to, modePaiement: modePaiement || undefined };

  // Table paginée (15/page)
  const { data, isLoading } = useSales({ page, pageSize: 15, ...filters });
  // Agrégat précis sur toute la période (pour totaux + répartition + export)
  const { data: allData } = useSales({ page: 1, pageSize: 1000, ...filters });
  const cancelMutation = useCancelSale();

  const allSales = useMemo(
    () => (allData?.data ?? []).filter((s) => s.statut !== "Annulée"),
    [allData]
  );

  // Résumé période (précis)
  const caTotal = allSales.reduce((s, v) => s + v.totalTTC, 0);
  const nbTransactions = allSales.length;
  const panierMoyen = nbTransactions > 0 ? caTotal / nbTransactions : 0;

  // Répartition CA : Wave 1% sur les transactions Mobile Money, puis parts dev/boutique
  const caWave = allSales.filter((s) => s.modePaiement === "MobileMoney").reduce((s, v) => s + v.totalTTC, 0);
  const fraisWave = Math.round(caWave * (WAVE_FEE_PCT / 100));
  const caNet = caTotal - fraisWave;
  const partDev = Math.round(caNet * (DEV_SHARE_PCT / 100));
  const partBoutique = caNet - partDev;

  // Graphique : CA par jour sur la période sélectionnée
  const chartData = useMemo(() => {
    const byDay = new Map<string, number>();
    allSales.forEach((s) => {
      const d = new Date(s.date);
      const key = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
      byDay.set(key, (byDay.get(key) ?? 0) + s.totalTTC);
    });
    return Array.from(byDay.entries()).reverse().map(([periode, montant]) => ({ periode, montant }));
  }, [allSales]);

  // ── Export ──
  const exportColumns: ExportColumn<Sale>[] = [
    { header: "Référence", value: (s) => s.id.slice(0, 8).toUpperCase() },
    { header: "Client", value: (s) => s.clientNom ?? "Anonyme" },
    { header: "Montant", value: (s) => s.totalTTC },
    { header: "Paiement", value: (s) => s.modePaiement },
    { header: "Statut", value: (s) => s.statut },
    { header: "Date", value: (s) => formatDateTime(s.date) },
  ];
  const periodLabel = PERIODS.find((p) => p.key === period)?.label ?? "";
  const handleExportCSV = () => {
    exportToCSV(`ventes_${period}`, exportColumns, allSales);
    toast.success("Export CSV téléchargé");
  };
  const handleExportPDF = () => {
    exportToPDF("Rapport des ventes", exportColumns, allSales, {
      subtitle: `Période : ${periodLabel}${modePaiement ? ` · ${modePaiement}` : ""}`,
      summary: [
        { label: "CA brut", value: formatPrice(caTotal) },
        { label: "Frais Wave", value: formatPrice(fraisWave) },
        { label: "CA net", value: formatPrice(caNet) },
        { label: "Transactions", value: `${nbTransactions}` },
      ],
    });
    toast.success("Export PDF téléchargé");
  };

  const columns: Column<Sale>[] = [
    {
      key: "id", header: "Référence",
      render: (row) => <span className="font-mono" style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.03em", color: GOLD }}>#{row.id.slice(0, 8).toUpperCase()}</span>,
    },
    {
      key: "clientNom", header: "Client",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(199,147,45,0.12)", fontSize: 12, fontWeight: 700, color: GOLD }}>
            {row.clientNom?.[0]?.toUpperCase() ?? "A"}
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, color: DARK }}>
            {row.clientNom ?? <span style={{ fontStyle: "italic", color: "rgba(81,49,2,0.45)" }}>Anonyme</span>}
          </span>
        </div>
      ),
    },
    {
      key: "totalTTC", header: "Montant",
      render: (row) => <span style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{formatPrice(row.totalTTC)}</span>,
    },
    {
      key: "modePaiement", header: "Paiement",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: "rgba(81,49,2,0.05)", color: "rgba(81,49,2,0.60)", fontSize: 12, fontWeight: 600 }}>
          <CreditCard className="w-3 h-3" /> {row.modePaiement}
        </span>
      ),
    },
    {
      key: "statut", header: "Statut",
      render: (row) => <AdminStatusBadge statut={row.statut} dot={false} />,
    },
    {
      key: "date", header: "Date",
      render: (row) => <span className="tabular-nums" style={{ fontSize: 13, color: "rgba(81,49,2,0.50)" }}>{formatDateTime(row.date)}</span>,
    },
    {
      key: "actions", header: "", className: "w-12",
      render: (row) => row.statut === "Complétée" || row.statut === "Completee" ? (
        <button onClick={(e) => { e.stopPropagation(); setCancelId(row.id); }}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ color: "rgba(81,49,2,0.55)", cursor: "pointer" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.10)"; (e.currentTarget as HTMLElement).style.color = "#DC2626"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(81,49,2,0.55)"; }}
          title="Annuler la vente" aria-label="Annuler la vente">
          <Ban className="w-4 h-4" />
        </button>
      ) : null,
    },
  ];

  const selectStyle = {
    height: 40, borderRadius: 10, border: "1.5px solid rgba(81,49,2,0.12)",
    background: "white", fontSize: 13.5, color: DARK, padding: "0 32px 0 12px",
    cursor: "pointer", appearance: "none" as const,
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23513102' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat" as const, backgroundPosition: "right 10px center",
  };

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-[1600px]">
      <AdminPageHeader icon={Receipt} title="Ventes" subtitle="Historique et analyse des transactions">
        <AdminExportButtons onCSV={handleExportCSV} onPDF={handleExportPDF} />
      </AdminPageHeader>

      {/* Barre de filtres */}
      <div className="admin-card p-4 flex flex-wrap items-center gap-4">
        {/* Période */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {PERIODS.map((p) => (
            <button key={p.key} onClick={() => { setPeriod(p.key); setPage(1); }}
              className="px-3.5 h-9 rounded-full transition-all"
              style={period === p.key
                ? { background: GOLD, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }
                : { background: "rgba(81,49,2,0.05)", color: "rgba(81,49,2,0.65)", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(199,147,45,0.15)" }}>
              {p.label}
            </button>
          ))}
        </div>
        <div className="w-px h-7 hidden sm:block" style={{ background: "rgba(81,49,2,0.10)" }} />
        {/* Moyen de paiement */}
        <select value={modePaiement} onChange={(e) => { setModePaiement(e.target.value); setPage(1); }} style={selectStyle}>
          <option value="">Tous les paiements</option>
          {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m === "MobileMoney" ? "Wave / Mobile Money" : m}</option>)}
        </select>
      </div>

      {/* Résumé période */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Banknote} label="CA total" value={formatPrice(caTotal)} accent={GOLD} />
        <StatCard icon={ShoppingCart} label="Transactions" value={`${nbTransactions}`} accent="#2563EB" />
        <StatCard icon={BarChart3} label="Panier moyen" value={formatPrice(panierMoyen)} accent="#2D7A4F" />
      </div>

      {/* Répartition du chiffre d'affaires */}
      <div className="admin-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-4 h-4" style={{ color: GOLD }} />
          <h3 style={{ fontSize: 15, fontWeight: 700, color: DARK }}>Répartition du chiffre d'affaires</h3>
          <span style={{ fontSize: 12, color: "rgba(81,49,2,0.45)" }}>· {periodLabel}</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: "CA brut", value: formatPrice(caTotal), sub: `${nbTransactions} ventes`, color: DARK },
            { label: `Frais Wave (${WAVE_FEE_PCT}%)`, value: `− ${formatPrice(fraisWave)}`, sub: `1% sur ${formatPrice(caWave)} Wave`, color: "#DC2626" },
            { label: "CA net", value: formatPrice(caNet), sub: "après frais", color: "#2D7A4F" },
            { label: `Part dev (${DEV_SHARE_PCT}%)`, value: formatPrice(partDev), sub: "du CA net", color: "#2563EB" },
            { label: `Part boutique (${100 - DEV_SHARE_PCT}%)`, value: formatPrice(partBoutique), sub: "du CA net", color: GOLD },
          ].map((c) => (
            <div key={c.label} className="p-3.5 rounded-xl" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(81,49,2,0.06)" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(81,49,2,0.50)" }}>{c.label}</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: c.color, fontFamily: "'Playfair Display', Georgia, serif", marginTop: 2 }}>{c.value}</p>
              <p style={{ fontSize: 11, color: "rgba(81,49,2,0.40)" }}>{c.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Graphique CA */}
      <div className="admin-card p-5">
        <h3 style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 16 }}>Chiffre d'affaires — {periodLabel.toLowerCase()}</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="caSalesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GOLD} stopOpacity={0.30} />
                  <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(81,49,2,0.06)" vertical={false} />
              <XAxis dataKey="periode" tick={{ fontSize: 11, fill: "rgba(81,49,2,0.45)" }} axisLine={false} tickLine={false} minTickGap={24} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(81,49,2,0.45)" }} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="montant" stroke={GOLD} strokeWidth={2.5} fill="url(#caSalesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center" style={{ fontSize: 14, color: "rgba(81,49,2,0.45)" }}>Données insuffisantes</div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        pagination={data?.pagination}
        onPageChange={setPage}
        loading={isLoading}
        onRowClick={setSelected}
        emptyTitle="Aucune vente"
        emptyDescription="Les ventes (POS et en ligne) apparaîtront ici"
      />

      {/* Drawer détail vente */}
      <AdminDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Vente #${selected.id.slice(0, 8).toUpperCase()}` : ""}
        subtitle={selected ? formatDateTime(selected.date) : ""}
        width={440}
        footer={
          selected && (
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(81,49,2,0.55)" }}>Total encaissé</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: GOLD, fontFamily: "'Playfair Display', Georgia, serif" }}>{formatPrice(selected.totalTTC)}</span>
            </div>
          )
        }
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { icon: User, label: "Client", value: selected.clientNom ?? "Anonyme" },
                { icon: CreditCard, label: "Paiement", value: selected.modePaiement },
                { icon: Calendar, label: "Date", value: formatDateTime(selected.date).split(" ")[0] },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.6)" }}>
                  <p className="flex items-center gap-1.5" style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "rgba(81,49,2,0.45)" }}>
                    <Icon className="w-3 h-3" /> {label}
                  </p>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: DARK, marginTop: 2 }}>{value}</p>
                </div>
              ))}
              <div className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.6)" }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", color: "rgba(81,49,2,0.45)" }}>Statut</p>
                <div className="mt-1.5"><AdminStatusBadge statut={selected.statut} dot={false} /></div>
              </div>
            </div>

            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(81,49,2,0.45)", marginBottom: 10 }}>
                Articles ({selected.items.length})
              </p>
              <div className="space-y-2">
                {selected.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(81,49,2,0.05)" }}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(199,147,45,0.10)" }}>
                        <Package className="w-4 h-4" style={{ color: GOLD }} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate" style={{ fontSize: 13.5, fontWeight: 500, color: DARK }}>
                          {item.productNom}{item.variante && <span style={{ color: "rgba(81,49,2,0.50)" }}> — {item.variante}</span>}
                        </p>
                        <p style={{ fontSize: 12, color: "rgba(81,49,2,0.50)" }}>×{item.quantite}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: DARK }}>{formatPrice(item.sousTotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </AdminDrawer>

      <AdminConfirmDialog
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={() => {
          if (cancelId) cancelMutation.mutate(cancelId, {
            onSuccess: () => toast.success("Vente annulée, stock réajusté"),
            onError: (e) => toast.error((e as Error).message),
            onSettled: () => { setCancelId(null); setSelected(null); },
          });
        }}
        title="Annuler la vente"
        description="La vente sera annulée et le stock des articles sera remis à jour automatiquement."
        confirmLabel="Annuler la vente"
        loading={cancelMutation.isPending}
      />
    </div>
  );
}
