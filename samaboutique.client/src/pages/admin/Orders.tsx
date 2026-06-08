import { useState } from "react";
import { ShoppingBag, Package, Loader2, Check, MapPin, User, Calendar, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { AdminPageHeader, AdminDrawer, AdminStatusBadge } from "@/components/admin/ui";
import { formatPrice, formatDateTime, cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";

const GOLD = "#C7932D";
const DARK = "#513102";

const STATUS_LABELS: Record<OrderStatus, string> = {
  EnAttente: "En attente", Confirmee: "Confirmée", EnPreparation: "En préparation",
  Expediee: "Expédiée", Livree: "Livrée", Annulee: "Annulée", Retournee: "Retournée",
};

const STATUS_NEXT: Record<OrderStatus, OrderStatus[]> = {
  EnAttente: ["Confirmee", "Annulee"],
  Confirmee: ["EnPreparation", "Annulee"],
  EnPreparation: ["Expediee"],
  Expediee: ["Livree"],
  Livree: [], Annulee: [], Retournee: [],
};

// Timeline du cycle de vie
const TIMELINE: OrderStatus[] = ["EnAttente", "Confirmee", "EnPreparation", "Expediee", "Livree"];

const FILTER_TABS: { value: OrderStatus | ""; label: string }[] = [
  { value: "", label: "Toutes" },
  { value: "EnAttente", label: "En attente" },
  { value: "Confirmee", label: "Confirmées" },
  { value: "EnPreparation", label: "En préparation" },
  { value: "Expediee", label: "Expédiées" },
  { value: "Livree", label: "Livrées" },
  { value: "Annulee", label: "Annulées" },
];

export default function Orders() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [selected, setSelected] = useState<Order | null>(null);

  const { data, isLoading } = useOrders({ page, pageSize: 15, statut: statusFilter || undefined });
  const updateStatusMutation = useUpdateOrderStatus();

  const columns: Column<Order>[] = [
    {
      key: "numeroFacture", header: "Référence",
      render: (row) => (
        <span className="font-mono" style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.03em", color: GOLD }}>
          #{row.numeroFacture ?? row.id.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "clientNom", header: "Client",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(199,147,45,0.12)", fontSize: 12, fontWeight: 700, color: GOLD }}>
            {row.clientNom?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span style={{ fontSize: 14, fontWeight: 500, color: DARK }}>{row.clientNom}</span>
        </div>
      ),
    },
    {
      key: "totalTTC", header: "Montant",
      render: (row) => <span style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{formatPrice(row.totalTTC)}</span>,
    },
    {
      key: "statut", header: "Statut",
      render: (row) => <AdminStatusBadge statut={row.statut} />,
    },
    {
      key: "createdAt", header: "Date",
      render: (row) => <span className="tabular-nums" style={{ fontSize: 13, color: "rgba(81,49,2,0.50)" }}>{formatDateTime(row.createdAt)}</span>,
    },
  ];

  const currentTimelineIdx = selected ? TIMELINE.indexOf(selected.statut) : -1;
  const isCancelled = selected?.statut === "Annulee";

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-[1600px]">
      <AdminPageHeader icon={ShoppingBag} title="Commandes" subtitle="Gérez les commandes en ligne" />

      {/* Filtres par statut (onglets) */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => { setStatusFilter(t.value); setPage(1); }}
            className="px-4 py-2 rounded-full transition-all"
            style={statusFilter === t.value
              ? { background: GOLD, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }
              : { background: "rgba(81,49,2,0.05)", color: "rgba(81,49,2,0.65)", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid rgba(199,147,45,0.15)" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        pagination={data?.pagination}
        onPageChange={setPage}
        loading={isLoading}
        onRowClick={setSelected}
        emptyTitle="Aucune commande"
        emptyDescription="Les commandes apparaîtront ici"
      />

      {/* Drawer détail commande */}
      <AdminDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Commande #${selected.numeroFacture ?? selected.id.slice(0, 8).toUpperCase()}` : ""}
        subtitle={selected ? formatDateTime(selected.createdAt) : ""}
        width={460}
        footer={
          selected && (
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(81,49,2,0.55)" }}>Total</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: GOLD, fontFamily: "'Playfair Display', Georgia, serif" }}>
                {formatPrice(selected.totalTTC)}
              </span>
            </div>
          )
        }
      >
        {selected && (
          <div className="space-y-6">
            {/* Statut actuel */}
            <div className="flex items-center justify-between">
              <AdminStatusBadge statut={selected.statut} />
            </div>

            {/* Timeline */}
            {!isCancelled && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(81,49,2,0.45)", marginBottom: 12 }}>
                  Suivi
                </p>
                <div className="flex items-center justify-between">
                  {TIMELINE.map((s, i) => {
                    const done = i <= currentTimelineIdx;
                    const active = i === currentTimelineIdx;
                    return (
                      <div key={s} className="flex flex-col items-center flex-1 relative">
                        {i < TIMELINE.length - 1 && (
                          <div className="absolute top-3 left-1/2 w-full h-0.5" style={{ background: i < currentTimelineIdx ? GOLD : "rgba(81,49,2,0.12)" }} />
                        )}
                        <div className="w-6 h-6 rounded-full flex items-center justify-center z-10"
                          style={{ background: done ? GOLD : "rgba(81,49,2,0.10)", border: active ? "2px solid #513102" : "none" }}>
                          {done && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="mt-1.5 text-center" style={{ fontSize: 9, fontWeight: active ? 700 : 500, color: done ? DARK : "rgba(81,49,2,0.40)", lineHeight: 1.1 }}>
                          {STATUS_LABELS[s]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Faire avancer */}
            {STATUS_NEXT[selected.statut]?.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(81,49,2,0.45)", marginBottom: 10 }}>
                  Actions
                </p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_NEXT[selected.statut].map((s) => (
                    <button
                      key={s}
                      disabled={updateStatusMutation.isPending}
                      onClick={() => {
                        updateStatusMutation.mutate(
                          { id: selected.id, statut: s },
                          {
                            onSuccess: () => { setSelected({ ...selected, statut: s }); toast.success(`Commande passée en "${STATUS_LABELS[s]}"`); },
                            onError: () => toast.error("Échec de la mise à jour"),
                          }
                        );
                      }}
                      className="px-4 h-10 rounded-full flex items-center gap-1.5 transition-all disabled:opacity-50"
                      style={s === "Annulee"
                        ? { background: "rgba(239,68,68,0.10)", color: "#DC2626", fontSize: 13, fontWeight: 600, cursor: "pointer" }
                        : { background: GOLD, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                    >
                      {updateStatusMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : `→ ${STATUS_LABELS[s]}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Infos client / livraison */}
            <div className="space-y-2.5">
              {[
                { icon: User, label: "Client", value: selected.clientNom },
                { icon: MapPin, label: "Livraison", value: selected.adresseLivraison || "—" },
                { icon: CreditCard, label: "Paiement", value: selected.modePaiement },
                { icon: Calendar, label: "Date", value: formatDateTime(selected.createdAt) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.6)" }}>
                  <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: GOLD }} />
                  <div className="min-w-0">
                    <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "rgba(81,49,2,0.45)" }}>{label}</p>
                    <p style={{ fontSize: 13.5, fontWeight: 500, color: DARK }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Articles */}
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
    </div>
  );
}
