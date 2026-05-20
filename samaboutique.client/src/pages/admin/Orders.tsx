import { useState } from "react";
import { ShoppingBag, X, Package, Loader2 } from "lucide-react";
import { useOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { formatPrice, formatDateTime, statusColor, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Order, OrderStatus } from "@/types";

const ORDER_STATUSES: OrderStatus[] = [
  "EnAttente", "Confirmee", "EnPreparation", "Expediee", "Livree", "Annulee",
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  EnAttente: "En attente",
  Confirmee: "Confirmée",
  EnPreparation: "En préparation",
  Expediee: "Expédiée",
  Livree: "Livrée",
  Annulee: "Annulée",
  Retournee: "Retournée",
};

const STATUS_NEXT: Record<OrderStatus, OrderStatus[]> = {
  EnAttente: ["Confirmee", "Annulee"],
  Confirmee: ["EnPreparation", "Annulee"],
  EnPreparation: ["Expediee"],
  Expediee: ["Livree"],
  Livree: [],
  Annulee: [],
  Retournee: [],
};

export default function Orders() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [selected, setSelected] = useState<Order | null>(null);

  const { data, isLoading } = useOrders({ page, pageSize: 15, statut: statusFilter || undefined });
  const updateStatusMutation = useUpdateOrderStatus();

  const columns: Column<Order>[] = [
    {
      key: "numeroFacture",
      header: "Référence",
      render: (row) => (
        <span className="font-mono text-sm font-bold tracking-wider" style={{ color: "var(--sama-terra)" }}>
          #{row.numeroFacture ?? row.id.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "clientNom",
      header: "Client",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: "var(--sama-terra-light)", color: "var(--sama-terra)" }}
          >
            {row.clientNom?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="text-sm font-medium">{row.clientNom}</span>
        </div>
      ),
    },
    {
      key: "totalTTC",
      header: "Montant",
      render: (row) => (
        <span className="font-bold text-sm text-foreground">{formatPrice(row.totalTTC)}</span>
      ),
    },
    {
      key: "statut",
      header: "Statut",
      render: (row) => (
        <span className={cn("inline-flex px-2.5 py-1 rounded-full text-xs font-semibold", statusColor(row.statut))}>
          {STATUS_LABELS[row.statut] ?? row.statut}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (row) => (
        <span className="text-xs text-muted-foreground tabular-nums">{formatDateTime(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-5">
      <PageHeader icon={ShoppingBag} title="Commandes" description="Gérez les commandes en ligne" />

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-semibold transition-all",
            !statusFilter ? "text-white shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
          style={!statusFilter ? { background: "var(--sama-terra)" } : undefined}
        >
          Toutes
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold transition-all",
              statusFilter === s ? "text-white shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
            style={statusFilter === s ? { background: "var(--sama-terra)" } : undefined}
          >
            {STATUS_LABELS[s]}
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

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-card w-full max-w-xl rounded-2xl shadow-2xl border border-border/50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full" style={{ background: "var(--sama-terra)" }} />
                <div>
                  <h3 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Commande #{selected.numeroFacture ?? selected.id.slice(0, 8).toUpperCase()}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(selected.createdAt)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Client + status info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/30 rounded-xl p-3.5">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Client</p>
                  <p className="text-sm font-semibold text-foreground">{selected.clientNom}</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-3.5">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Statut</p>
                  <span className={cn("inline-flex px-2.5 py-1 rounded-full text-xs font-semibold", statusColor(selected.statut))}>
                    {STATUS_LABELS[selected.statut] ?? selected.statut}
                  </span>
                </div>
              </div>

              {/* Change status */}
              {STATUS_NEXT[selected.statut]?.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    Faire avancer la commande
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
                              onSuccess: () => {
                                setSelected({ ...selected, statut: s });
                                toast.success(`Commande passée en "${STATUS_LABELS[s]}"`);
                              },
                              onError: () => toast.error("Échec de la mise à jour du statut"),
                            }
                          );
                        }}
                        className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 btn-lift disabled:opacity-50 flex items-center gap-1.5"
                        style={
                          s === "Annulee"
                            ? { background: "rgba(239,68,68,0.1)", color: "rgb(239,68,68)" }
                            : { background: "var(--sama-terra)", color: "white" }
                        }
                      >
                        {updateStatusMutation.isPending
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : `→ ${STATUS_LABELS[s]}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Articles</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-muted/20 border border-border/30">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Package className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.productNom}</p>
                          <p className="text-xs text-muted-foreground">×{item.quantite}</p>
                        </div>
                      </div>
                      <span className="font-bold text-sm text-foreground flex-shrink-0 ml-3">
                        {formatPrice(item.sousTotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer total */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-muted/20">
              <span className="text-sm font-semibold text-muted-foreground">Total commande</span>
              <span className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "var(--sama-terra)" }}>
                {formatPrice(selected.totalTTC)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
