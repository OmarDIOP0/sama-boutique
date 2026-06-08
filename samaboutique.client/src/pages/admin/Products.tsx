import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Package, Tag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useProducts, useDeleteProduct, useCategories, useApplyBulkPromo, useRemoveBulkPromo } from "@/hooks/useProducts";
import { DataTable, type Column } from "@/components/shared/DataTable";
import {
  AdminPageHeader, AdminSearchInput, AdminConfirmDialog, AdminStatusBadge, AdminExportButtons, AdminModal,
} from "@/components/admin/ui";
import { exportToCSV, exportToPDF, type ExportColumn } from "@/lib/export";
import { formatPrice, debounce, cn } from "@/lib/utils";
import type { Product } from "@/types";

const GOLD = "#C7932D";
const DARK = "#513102";

// Badge stock coloré selon le niveau
function StockBadge({ total }: { total: number }) {
  const cfg = total === 0
    ? { bg: "rgba(239,68,68,0.10)", color: "#DC2626", pulse: true }
    : total < 5
      ? { bg: "rgba(199,147,45,0.12)", color: GOLD, pulse: false }
      : { bg: "rgba(45,122,79,0.10)", color: "#2D7A4F", pulse: false };
  return (
    <span
      className={cn("inline-flex items-center px-2.5 py-1 rounded-lg", cfg.pulse && "animate-pulse")}
      style={{ background: cfg.bg, color: cfg.color, fontSize: 12, fontWeight: 600 }}
    >
      {total} unité{total > 1 ? "s" : ""}
    </span>
  );
}

export default function Products() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [statut, setStatut] = useState<string>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoPct, setPromoPct] = useState(10);
  const [promoCategoryId, setPromoCategoryId] = useState<string>("");

  const { data, isLoading } = useProducts({
    page,
    pageSize: 15,
    search: debouncedSearch || undefined,
    categoryId,
    statut: statut || undefined,
  });
  const { data: categories = [] } = useCategories();
  // Export : tous les produits filtrés
  const { data: allData } = useProducts({ page: 1, pageSize: 1000, search: debouncedSearch || undefined, categoryId, statut: statut || undefined });
  const deleteMutation = useDeleteProduct();
  const applyPromoMutation = useApplyBulkPromo();
  const removePromoMutation = useRemoveBulkPromo();

  const handleSearch = useCallback(
    debounce((val: string) => { setDebouncedSearch(val); setPage(1); }, 300),
    []
  );

  // ── Export ──
  const exportRows = allData?.data ?? [];
  const exportCols: ExportColumn<Product>[] = [
    { header: "Produit", value: (p) => p.nom },
    { header: "Catégorie", value: (p) => p.categoryNom ?? "" },
    { header: "Prix achat", value: (p) => p.prixAchat },
    { header: "Prix vente", value: (p) => p.prixVente },
    { header: "Stock total", value: (p) => p.variants.reduce((s, v) => s + v.stockActuel, 0) },
    { header: "Statut", value: (p) => p.statut },
    { header: "Code-barres", value: (p) => p.codeBarres ?? "" },
  ];
  const handleExportCSV = () => { exportToCSV("produits", exportCols, exportRows); toast.success("Export CSV téléchargé"); };
  const handleExportPDF = () => {
    exportToPDF("Catalogue produits", exportCols, exportRows, {
      subtitle: `${exportRows.length} produit(s)`,
    });
    toast.success("Export PDF téléchargé");
  };

  const columns: Column<Product>[] = [
    {
      key: "nom",
      header: "Produit",
      render: (row) => {
        const stockTotal = row.variants.reduce((s, v) => s + v.stockActuel, 0);
        const alert = stockTotal < 5; // stock bas ou rupture
        const rupture = stockTotal === 0;
        return (
          <div className="flex items-center gap-3">
            {/* Point pulsant si en alerte stock */}
            <span className="w-2.5 flex-shrink-0 flex items-center justify-center">
              {alert && (
                <span className="relative flex w-2 h-2" title={rupture ? "Rupture de stock" : "Stock bas"}>
                  <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping"
                    style={{ background: rupture ? "#DC2626" : "#C7932D" }} />
                  <span className="relative inline-flex rounded-full w-2 h-2"
                    style={{ background: rupture ? "#DC2626" : "#C7932D" }} />
                </span>
              )}
            </span>
            <div className="w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(199,147,45,0.08)", border: "1px solid rgba(81,49,2,0.08)" }}>
              {row.photos[0] ? (
                <img src={row.photos[0]} alt={row.nom} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-5 h-5" style={{ color: "rgba(81,49,2,0.25)" }} />
              )}
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: DARK, lineHeight: 1.2 }}>{row.nom}</p>
              {row.categoryNom && (
                <p style={{ fontSize: 13, color: "rgba(81,49,2,0.50)", marginTop: 1 }}>{row.categoryNom}</p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "prixVente",
      header: "Prix vente",
      render: (row) => (
        row.enPromo ? (
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 14, fontWeight: 700, color: "#DC2626" }}>{formatPrice(row.prixPromo ?? 0)}</span>
            <span style={{ fontSize: 12, color: "rgba(81,49,2,0.40)", textDecoration: "line-through" }}>{formatPrice(row.prixVente)}</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ background: "rgba(220,38,38,0.10)", color: "#DC2626" }}>-{row.remisePct}%</span>
          </div>
        ) : (
          <span style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>{formatPrice(row.prixVente)}</span>
        )
      ),
    },
    {
      key: "stockTotal" as keyof Product,
      header: "Stock total",
      render: (row) => <StockBadge total={row.variants.reduce((s, v) => s + v.stockActuel, 0)} />,
    },
    {
      key: "statut",
      header: "Statut",
      render: (row) => <AdminStatusBadge statut={row.statut} dot={false} />,
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/admin/products/${row.id}/edit`); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: "rgba(81,49,2,0.55)", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(199,147,45,0.10)"; (e.currentTarget as HTMLElement).style.color = GOLD; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(81,49,2,0.55)"; }}
            title="Modifier" aria-label="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteId(row.id); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: "rgba(81,49,2,0.55)", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.10)"; (e.currentTarget as HTMLElement).style.color = "#DC2626"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(81,49,2,0.55)"; }}
            title="Supprimer" aria-label="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const selectStyle = {
    height: 44, borderRadius: 12, border: "1.5px solid rgba(81,49,2,0.12)",
    background: "white", fontSize: 14, color: DARK, padding: "0 36px 0 14px",
    cursor: "pointer", appearance: "none" as const,
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23513102' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
    backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
  };

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-[1600px]">
      <AdminPageHeader icon={Package} iconColor="brown" title="Produits" subtitle="Gérez votre catalogue">
        <AdminExportButtons onCSV={handleExportCSV} onPDF={handleExportPDF} />
        <button onClick={() => setPromoOpen(true)} className="admin-btn-outline" style={{ height: 40 }}>
          <Tag className="w-4 h-4" /> Promotion
        </button>
        <Link to="/admin/products/new" className="admin-btn-gold">
          <Plus className="w-4 h-4" />
          Nouveau produit
        </Link>
      </AdminPageHeader>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <AdminSearchInput
          value={search}
          onChange={(v) => { setSearch(v); handleSearch(v); }}
          placeholder="Rechercher un produit…"
          className="flex-1 min-w-52 max-w-sm"
        />
        <select value={categoryId ?? ""} onChange={(e) => { setCategoryId(e.target.value || undefined); setPage(1); }} style={selectStyle}>
          <option value="">Toutes les catégories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
        </select>
        <select value={statut} onChange={(e) => { setStatut(e.target.value); setPage(1); }} style={selectStyle}>
          <option value="">Tous les statuts</option>
          <option value="Actif">Actif</option>
          <option value="Inactif">Inactif</option>
          <option value="Archivé">Archivé</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        pagination={data?.pagination}
        onPageChange={setPage}
        loading={isLoading}
        onRowClick={(row) => navigate(`/admin/products/${row.id}/edit`)}
        emptyTitle="Aucun produit"
        emptyDescription="Créez votre premier produit pour commencer"
      />

      {/* Modal promotion groupée */}
      <AdminModal
        open={promoOpen}
        onClose={() => setPromoOpen(false)}
        icon={Tag}
        title="Promotion groupée"
        subtitle="Appliquer une remise sur plusieurs produits"
        persistent={applyPromoMutation.isPending || removePromoMutation.isPending}
        footer={
          <>
            <button
              onClick={() => removePromoMutation.mutate(promoCategoryId || undefined, {
                onSuccess: (res: any) => { toast.success(res?.data?.message ?? "Promotions retirées"); setPromoOpen(false); },
                onError: (e) => toast.error((e as Error).message),
              })}
              disabled={removePromoMutation.isPending}
              className="admin-btn-outline" style={{ borderColor: "rgba(220,38,38,0.3)", color: "#DC2626" }}>
              {removePromoMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Retirer les promos
            </button>
            <button
              onClick={() => applyPromoMutation.mutate({ remisePct: promoPct, categoryId: promoCategoryId || undefined }, {
                onSuccess: (res: any) => { toast.success(res?.data?.message ?? "Promotion appliquée"); setPromoOpen(false); },
                onError: (e) => toast.error((e as Error).message),
              })}
              disabled={applyPromoMutation.isPending}
              className="admin-btn-gold">
              {applyPromoMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Appliquer −{promoPct}%
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "rgba(81,49,2,0.55)" }}>
              Remise (%)
            </label>
            <div className="flex items-center gap-3">
              <input type="range" min={5} max={70} step={5} value={promoPct}
                onChange={(e) => setPromoPct(Number(e.target.value))}
                className="flex-1" style={{ accentColor: "#C7932D" }} />
              <span style={{ fontSize: 22, fontWeight: 800, color: "#C7932D", minWidth: 56, fontFamily: "'Bricolage Grotesque', sans-serif" }}>−{promoPct}%</span>
            </div>
          </div>
          <div>
            <label className="block mb-2" style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "rgba(81,49,2,0.55)" }}>
              Cible
            </label>
            <select value={promoCategoryId} onChange={(e) => setPromoCategoryId(e.target.value)}
              className="w-full" style={{ height: 46, borderRadius: 12, padding: "0 14px", border: "1.5px solid rgba(81,49,2,0.14)", background: "white", fontSize: 15, color: "#513102", cursor: "pointer" }}>
              <option value="">Tous les produits actifs</option>
              {categories.map((c) => <option key={c.id} value={c.id}>Catégorie : {c.nom}</option>)}
            </select>
          </div>
          <div className="p-3 rounded-xl" style={{ background: "rgba(199,147,45,0.06)", border: "1px solid rgba(199,147,45,0.15)" }}>
            <p style={{ fontSize: 12.5, color: "rgba(81,49,2,0.65)", lineHeight: 1.5 }}>
              💡 Le prix promo = prix de vente − {promoPct}%. Le prix barré sera affiché sur la boutique avec un badge <strong>−{promoPct}%</strong>.
            </p>
          </div>
        </div>
      </AdminModal>

      <AdminConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId, {
            onSuccess: () => toast.success("Produit supprimé"),
            onError: (e) => toast.error((e as Error).message || "Erreur lors de la suppression"),
            onSettled: () => setDeleteId(null),
          });
        }}
        title="Supprimer le produit"
        description="Cette action est irréversible. Le produit et ses données associées seront définitivement supprimés."
        confirmLabel="Supprimer"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
