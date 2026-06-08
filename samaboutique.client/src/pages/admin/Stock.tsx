import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Warehouse, Plus, Loader2, TrendingUp, TrendingDown, RefreshCw,
  AlertTriangle, Package, Boxes,
} from "lucide-react";
import { toast } from "sonner";
import { useStockMovements, useAddStockMovement } from "@/hooks/useStock";
import { useProducts, useStockAlerts } from "@/hooks/useProducts";
import { stockMovementSchema, type StockMovementFormData } from "@/lib/validators";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { AdminPageHeader, AdminModal } from "@/components/admin/ui";
import { formatPrice, formatDateTime, cn } from "@/lib/utils";
import type { StockMovement } from "@/types";

const GOLD = "#C7932D";
const DARK = "#513102";

const TYPE_CONFIG: Record<string, { color: string; bg: string; Icon: typeof TrendingUp }> = {
  "Entrée": { color: "#2D7A4F", bg: "rgba(45,122,79,0.10)", Icon: TrendingUp },
  "Sortie": { color: "#DC2626", bg: "rgba(239,68,68,0.10)", Icon: TrendingDown },
  "Vente": { color: "#DC2626", bg: "rgba(239,68,68,0.10)", Icon: TrendingDown },
  "Retour": { color: "#2D7A4F", bg: "rgba(45,122,79,0.10)", Icon: TrendingUp },
  "Ajustement": { color: GOLD, bg: "rgba(199,147,45,0.12)", Icon: RefreshCw },
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "rgba(81,49,2,0.55)" }}>
      {children}
    </label>
  );
}

const inputStyle = (err?: boolean): React.CSSProperties => ({
  width: "100%", height: 46, borderRadius: 12, padding: "0 14px",
  border: `1.5px solid ${err ? "#EF4444" : "rgba(81,49,2,0.14)"}`,
  background: "white", fontSize: 15, color: DARK, outline: "none",
});

// Mini KPI card inline
function StatCard({ icon: Icon, label, value, accent }: { icon: React.ElementType; label: string; value: string; accent: string }) {
  return (
    <div className="admin-card p-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent}1A` }}>
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(81,49,2,0.50)" }}>{label}</p>
        <p style={{ fontSize: 20, fontWeight: 800, color: DARK, fontFamily: "'Playfair Display', Georgia, serif" }}>{value}</p>
      </div>
    </div>
  );
}

export default function Stock() {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useStockMovements({ page, pageSize: 15 });
  const { data: productsData } = useProducts({ statut: "Actif", pageSize: 100 });
  const { data: alerts = [] } = useStockAlerts();
  const addMovementMutation = useAddStockMovement();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<StockMovementFormData>({
    resolver: zodResolver(stockMovementSchema),
    defaultValues: { type: "Entrée", quantite: 1 },
  });
  const selectedType = watch("type");

  const onSubmit = (formData: StockMovementFormData) => {
    addMovementMutation.mutate(formData, {
      onSuccess: () => { reset(); setShowModal(false); toast.success("Mouvement de stock enregistré"); },
      onError: (e) => toast.error((e as Error).message || "Erreur lors de l'enregistrement"),
    });
  };

  // Stats
  const products = productsData?.data ?? [];
  const totalStock = products.reduce((s, p) => s + p.variants.reduce((vs, v) => vs + v.stockActuel, 0), 0);
  const valeurStock = products.reduce((s, p) => s + p.variants.reduce((vs, v) => vs + v.stockActuel * p.prixVente, 0), 0);
  const ruptures = alerts.filter((a) => a.stockActuel === 0).length;

  const variantOptions: { id: string; label: string }[] = [];
  products.forEach((p) => {
    p.variants.forEach((v) => {
      const info = [v.taille, v.couleur].filter(Boolean).join("/") || "Standard";
      variantOptions.push({ id: v.id, label: `${p.nom} — ${info} (stock: ${v.stockActuel})` });
    });
  });

  const columns: Column<StockMovement>[] = [
    {
      key: "productNom", header: "Produit / Variante",
      render: (row) => (
        <div>
          <p style={{ fontSize: 14.5, fontWeight: 600, color: DARK }}>{row.productNom}</p>
          {row.variante && <p style={{ fontSize: 12.5, color: "rgba(81,49,2,0.50)", marginTop: 1 }}>{row.variante}</p>}
        </div>
      ),
    },
    {
      key: "type", header: "Type",
      render: (row) => {
        const cfg = TYPE_CONFIG[row.type] ?? { color: "rgba(81,49,2,0.55)", bg: "rgba(81,49,2,0.06)", Icon: RefreshCw };
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 600 }}>
            <cfg.Icon className="w-3 h-3" />
            {row.type}
          </span>
        );
      },
    },
    {
      key: "quantite", header: "Quantité",
      render: (row) => {
        const isEntry = row.type === "Entrée" || row.type === "Retour";
        return <span style={{ fontSize: 15, fontWeight: 700, color: isEntry ? "#2D7A4F" : "#DC2626" }}>{isEntry ? "+" : "−"}{row.quantite}</span>;
      },
    },
    {
      key: "stockApres", header: "Stock après",
      render: (row) => <span style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{row.stockApres}</span>,
    },
    {
      key: "motif", header: "Motif",
      render: (row) => <span style={{ fontSize: 13, color: "rgba(81,49,2,0.55)", fontStyle: row.motif ? "normal" : "italic" }}>{row.motif ?? "—"}</span>,
    },
    {
      key: "date", header: "Date",
      render: (row) => <span className="tabular-nums" style={{ fontSize: 13, color: "rgba(81,49,2,0.50)" }}>{formatDateTime(row.date)}</span>,
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-[1600px]">
      <AdminPageHeader icon={Warehouse} title="Stock" subtitle="Mouvements et niveaux de stock">
        <button onClick={() => setShowModal(true)} className="admin-btn-gold">
          <Plus className="w-4 h-4" />
          Nouveau mouvement
        </button>
      </AdminPageHeader>

      {/* KPI inline */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Boxes} label="Total en stock" value={`${totalStock} u.`} accent="#2D7A4F" />
        <StatCard icon={Package} label="Valeur du stock" value={formatPrice(valeurStock)} accent={GOLD} />
        <StatCard icon={AlertTriangle} label="Produits en alerte" value={`${alerts.length}`} accent="#DC2626" />
      </div>

      {/* Bannière rupture */}
      {ruptures > 0 && (
        <div className="flex items-center justify-between gap-3 p-4 rounded-2xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.20)" }}>
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "#DC2626" }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: "#DC2626" }}>
              {ruptures} produit{ruptures > 1 ? "s" : ""} en rupture de stock
            </p>
          </div>
          <button onClick={() => setShowModal(true)} className="px-4 h-9 rounded-full flex items-center gap-1.5"
            style={{ background: "#DC2626", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <Plus className="w-3.5 h-3.5" /> Réapprovisionner
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        pagination={data?.pagination}
        onPageChange={setPage}
        loading={isLoading}
        emptyTitle="Aucun mouvement de stock"
        emptyDescription="Les mouvements apparaîtront ici"
      />

      {/* Modal nouveau mouvement */}
      <AdminModal
        open={showModal}
        onClose={() => setShowModal(false)}
        icon={Warehouse}
        title="Nouveau mouvement de stock"
        persistent={addMovementMutation.isPending}
        footer={
          <>
            <button type="button" onClick={() => setShowModal(false)} className="admin-btn-outline">Annuler</button>
            <button type="submit" form="stock-form" disabled={addMovementMutation.isPending} className="admin-btn-gold">
              {addMovementMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Enregistrer
            </button>
          </>
        }
      >
        <form id="stock-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <FieldLabel>Variante du produit *</FieldLabel>
            <select {...register("variantId")} style={{ ...inputStyle(!!errors.variantId), cursor: "pointer" }}>
              <option value="">Sélectionner une variante…</option>
              {variantOptions.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
            </select>
            {errors.variantId && <p className="mt-1.5" style={{ fontSize: 12, color: "#DC2626" }}>{errors.variantId.message}</p>}
          </div>

          {/* Type — radio pills */}
          <div>
            <FieldLabel>Type de mouvement *</FieldLabel>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "Entrée", label: "Entrée", icon: TrendingUp, color: "#2D7A4F" },
                { value: "Sortie", label: "Sortie", icon: TrendingDown, color: "#DC2626" },
                { value: "Ajustement", label: "Correction", icon: RefreshCw, color: GOLD },
              ].map((t) => (
                <label key={t.value} className="flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all"
                  style={{
                    border: selectedType === t.value ? `2px solid ${t.color}` : "1.5px solid rgba(81,49,2,0.12)",
                    background: selectedType === t.value ? `${t.color}0D` : "white",
                    cursor: "pointer",
                  }}>
                  <input type="radio" value={t.value} {...register("type")} className="sr-only" />
                  <t.icon className="w-4 h-4" style={{ color: selectedType === t.value ? t.color : "rgba(81,49,2,0.40)" }} />
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: selectedType === t.value ? t.color : "rgba(81,49,2,0.55)" }}>{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Quantité *</FieldLabel>
            <input {...register("quantite")} type="number" min={1} style={inputStyle(!!errors.quantite)} placeholder="1" />
            {errors.quantite && <p className="mt-1.5" style={{ fontSize: 12, color: "#DC2626" }}>{errors.quantite.message}</p>}
          </div>

          <div>
            <FieldLabel>Motif (optionnel)</FieldLabel>
            <input {...register("motif")} style={inputStyle()} placeholder="Ex : Réapprovisionnement fournisseur…" />
          </div>

          {addMovementMutation.error && (
            <div className="p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
              <p style={{ fontSize: 13, color: "#DC2626" }}>{(addMovementMutation.error as Error).message}</p>
            </div>
          )}
        </form>
      </AdminModal>
    </div>
  );
}
