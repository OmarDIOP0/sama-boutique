import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Warehouse, Plus, X, Loader2, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { useStockMovements, useAddStockMovement } from "@/hooks/useStock";
import { useProducts } from "@/hooks/useProducts";
import { stockMovementSchema, type StockMovementFormData } from "@/lib/validators";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { formatDateTime, cn } from "@/lib/utils";
import type { StockMovement } from "@/types";

const TYPE_CONFIG: Record<string, { color: string; bg: string; Icon: typeof TrendingUp }> = {
  "Entrée":     { color: "text-success",  bg: "bg-success/10",  Icon: TrendingUp },
  "Sortie":     { color: "text-danger",   bg: "bg-danger/10",   Icon: TrendingDown },
  "Ajustement": { color: "text-warning",  bg: "bg-warning/10",  Icon: RefreshCw },
};

// Reusable modal field label
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2.5">
      {children}
    </label>
  );
}

export default function Stock() {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useStockMovements({ page, pageSize: 15 });
  const { data: productsData } = useProducts({ statut: "Actif", pageSize: 100 });
  const addMovementMutation = useAddStockMovement();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StockMovementFormData>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: { type: "Entrée", quantite: 1 },
  });

  const onSubmit = (data: StockMovementFormData) => {
    addMovementMutation.mutate(data, {
      onSuccess: () => { reset(); setShowModal(false); },
    });
  };

  const variantOptions: { id: string; label: string }[] = [];
  productsData?.data?.forEach((p) => {
    p.variants.forEach((v) => {
      const info = [v.taille, v.couleur].filter(Boolean).join("/") || "Standard";
      variantOptions.push({ id: v.id, label: `${p.nom} — ${info} (stock: ${v.stockActuel})` });
    });
  });

  const columns: Column<StockMovement>[] = [
    {
      key: "productNom",
      header: "Produit / Variante",
      render: (row) => (
        <div>
          <p className="text-sm font-semibold text-foreground">{row.productNom}</p>
          {row.variante && <p className="text-xs text-muted-foreground mt-0.5">{row.variante}</p>}
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (row) => {
        const cfg = TYPE_CONFIG[row.type] ?? { color: "text-muted-foreground", bg: "bg-muted", Icon: RefreshCw };
        return (
          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", cfg.color, cfg.bg)}>
            <cfg.Icon className="w-3 h-3" />
            {row.type}
          </span>
        );
      },
    },
    {
      key: "quantite",
      header: "Quantité",
      render: (row) => (
        <span className={cn("font-bold text-base", row.type === "Entrée" ? "text-success" : "text-danger")}>
          {row.type === "Entrée" ? "+" : "−"}{row.quantite}
        </span>
      ),
    },
    {
      key: "stockApres",
      header: "Stock après",
      render: (row) => (
        <span className="text-sm font-semibold text-foreground">{row.stockApres}</span>
      ),
    },
    {
      key: "motif",
      header: "Motif",
      render: (row) => (
        <span className="text-xs text-muted-foreground">{row.motif ?? <span className="italic">—</span>}</span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (row) => (
        <span className="text-xs text-muted-foreground tabular-nums">{formatDateTime(row.date)}</span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-5">
      <PageHeader icon={Warehouse} title="Stock" description="Gérez les mouvements de stock">
        <button onClick={() => setShowModal(true)} className="btn-terra">
          <Plus className="w-4 h-4" />
          Nouveau mouvement
        </button>
      </PageHeader>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        pagination={data?.pagination}
        onPageChange={setPage}
        loading={isLoading}
        emptyTitle="Aucun mouvement de stock"
        emptyDescription="Les mouvements apparaîtront ici"
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border/50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full" style={{ background: "var(--sama-terra)" }} />
                <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Nouveau mouvement de stock
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="p-6 space-y-5">
                <div>
                  <FieldLabel>Variante du produit *</FieldLabel>
                  <select
                    {...register("variantId")}
                    className={cn("input-field", errors.variantId && "border-danger/60")}
                  >
                    <option value="">Sélectionner une variante…</option>
                    {variantOptions.map((v) => (
                      <option key={v.id} value={v.id}>{v.label}</option>
                    ))}
                  </select>
                  {errors.variantId && <p className="mt-1.5 text-xs text-danger">{errors.variantId.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Type de mouvement *</FieldLabel>
                    <select {...register("type")} className="input-field">
                      <option value="Entrée">📥 Entrée</option>
                      <option value="Sortie">📤 Sortie</option>
                      <option value="Ajustement">🔄 Ajustement</option>
                    </select>
                  </div>

                  <div>
                    <FieldLabel>Quantité *</FieldLabel>
                    <input
                      {...register("quantite")}
                      type="number"
                      min={1}
                      className={cn("input-field", errors.quantite && "border-danger/60")}
                      placeholder="1"
                    />
                    {errors.quantite && <p className="mt-1.5 text-xs text-danger">{errors.quantite.message}</p>}
                  </div>
                </div>

                <div>
                  <FieldLabel>Motif (optionnel)</FieldLabel>
                  <input
                    {...register("motif")}
                    className="input-field"
                    placeholder="Ex : Réapprovisionnement fournisseur, correction inventaire…"
                  />
                </div>

                {addMovementMutation.error && (
                  <div className="p-3 rounded-xl bg-danger/8 border border-danger/20 text-sm text-danger">
                    {(addMovementMutation.error as Error).message}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 justify-end px-6 py-4 border-t border-border/50 bg-muted/20">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-outline"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={addMovementMutation.isPending}
                  className="btn-terra"
                >
                  {addMovementMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
