import { useState } from "react";
import { Receipt, X, Package, CreditCard, User, Calendar, Ban } from "lucide-react";
import { useSales, useCancelSale } from "@/hooks/useSales";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatPrice, formatDateTime, statusColor, cn } from "@/lib/utils";
import type { Sale } from "@/types";

export default function Sales() {
  const [page, setPage] = useState(1);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Sale | null>(null);

  const { data, isLoading } = useSales({ page, pageSize: 15 });
  const cancelMutation = useCancelSale();

  const columns: Column<Sale>[] = [
    {
      key: "id",
      header: "Référence",
      render: (row) => (
        <span className="font-mono text-sm font-bold tracking-wider" style={{ color: "var(--sama-terra)" }}>
          #{row.id.slice(0, 8).toUpperCase()}
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
            {row.clientNom?.[0]?.toUpperCase() ?? "A"}
          </div>
          <span className="text-sm font-medium">
            {row.clientNom ?? <span className="text-muted-foreground italic">Anonyme</span>}
          </span>
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
      key: "modePaiement",
      header: "Paiement",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs font-semibold text-muted-foreground">
          <CreditCard className="w-3 h-3" />
          {row.modePaiement}
        </span>
      ),
    },
    {
      key: "statut",
      header: "Statut",
      render: (row) => (
        <span className={cn("inline-flex px-2.5 py-1 rounded-full text-xs font-semibold", statusColor(row.statut))}>
          {row.statut}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (row) => (
        <span className="text-xs text-muted-foreground tabular-nums">{formatDateTime(row.date)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (row) => (
        row.statut === "Completee" ? (
          <button
            onClick={(e) => { e.stopPropagation(); setCancelId(row.id); }}
            className="w-8 h-8 rounded-xl hover:bg-danger/10 flex items-center justify-center text-muted-foreground hover:text-danger transition-colors"
            title="Annuler la vente"
          >
            <Ban className="w-4 h-4" />
          </button>
        ) : null
      ),
    },
  ];

  return (
    <div className="p-6 space-y-5">
      <PageHeader icon={Receipt} title="Ventes" description="Historique de toutes les transactions" />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        pagination={data?.pagination}
        onPageChange={setPage}
        loading={isLoading}
        onRowClick={setSelected}
        emptyTitle="Aucune vente"
        emptyDescription="Les ventes apparaîtront ici"
      />

      {/* Sale detail modal */}
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
                    Vente #{selected.id.slice(0, 8).toUpperCase()}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(selected.date)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Meta info grid */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: User, label: "Client", value: selected.clientNom ?? "Anonyme" },
                  { icon: CreditCard, label: "Paiement", value: selected.modePaiement },
                  { icon: Calendar, label: "Date", value: formatDateTime(selected.date).split(" ")[0] },
                  { icon: null, label: "Statut", value: selected.statut, isStatus: true },
                ].map(({ icon: Icon, label, value, isStatus }) => (
                  <div key={label} className="bg-muted/30 rounded-xl p-3.5">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                      {label}
                    </p>
                    {isStatus ? (
                      <span className={cn("inline-flex px-2 py-0.5 rounded-full text-xs font-semibold", statusColor(value))}>
                        {value}
                      </span>
                    ) : (
                      <p className="text-sm font-semibold text-foreground truncate">{value}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Articles */}
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Articles</p>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-muted/20 border border-border/30">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: "var(--sama-terra-light)" }}
                        >
                          <Package className="w-3.5 h-3.5" style={{ color: "var(--sama-terra)" }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {item.productNom}
                            {item.variante && <span className="text-muted-foreground"> — {item.variante}</span>}
                          </p>
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
              <span className="text-sm font-semibold text-muted-foreground">Total encaissé</span>
              <span className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "var(--sama-terra)" }}>
                {formatPrice(selected.totalTTC)}
              </span>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={() => {
          if (cancelId) cancelMutation.mutate(cancelId, { onSettled: () => { setCancelId(null); setSelected(null); } });
        }}
        title="Annuler la vente"
        description="La vente sera annulée et le stock des articles sera remis à jour automatiquement."
        confirmLabel="Annuler la vente"
        loading={cancelMutation.isPending}
      />
    </div>
  );
}
