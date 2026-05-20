import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { useProducts, useDeleteProduct, useCategories } from "@/hooks/useProducts";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatPrice, statusColor, cn, debounce } from "@/lib/utils";
import type { Product } from "@/types";

export default function Products() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useProducts({
    page,
    pageSize: 15,
    search: debouncedSearch || undefined,
    categoryId,
  });
  const { data: categories = [] } = useCategories();
  const deleteMutation = useDeleteProduct();

  const handleSearch = useCallback(
    debounce((val: string) => {
      setDebouncedSearch(val);
      setPage(1);
    }, 300),
    []
  );

  const columns: Column<Product>[] = [
    {
      key: "nom",
      header: "Produit",
      render: (row) => {
        const stockTotal = row.variants.reduce((s, v) => s + v.stockActuel, 0);
        return (
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-muted flex items-center justify-center flex-shrink-0 border border-border/40">
              {row.photos[0] ? (
                <img src={row.photos[0]} alt={row.nom} className="w-full h-full object-cover" />
              ) : (
                <Package className="w-5 h-5 text-muted-foreground/50" />
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground text-base leading-tight">{row.nom}</p>
              {row.categoryNom && (
                <p className="text-sm text-muted-foreground mt-0.5">{row.categoryNom}</p>
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
        <span className="font-bold text-sm text-foreground">{formatPrice(row.prixVente)}</span>
      ),
    },
    {
      key: "stockTotal" as keyof Product,
      header: "Stock total",
      render: (row) => {
        const stockTotal = row.variants.reduce((s, v) => s + v.stockActuel, 0);
        const color = stockTotal === 0 ? "text-danger bg-danger/10" : stockTotal < 5 ? "text-warning bg-warning/10" : "text-success bg-success/10";
        return (
          <span className={cn("inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold", color)}>
            {stockTotal} unité{stockTotal > 1 ? "s" : ""}
          </span>
        );
      },
    },
    {
      key: "statut",
      header: "Statut",
      render: (row) => (
        <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold", statusColor(row.statut))}>
          {row.statut}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-24",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/admin/products/${row.id}/edit`); }}
            className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteId(row.id); }}
            className="w-8 h-8 rounded-xl hover:bg-danger/10 flex items-center justify-center text-muted-foreground hover:text-danger transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-5">
      <PageHeader icon={Package} title="Produits" description="Gérez votre catalogue">
        <Link
          to="/admin/products/new"
          className="btn-terra"
        >
          <Plus className="w-4 h-4" />
          Nouveau produit
        </Link>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); handleSearch(e.target.value); }}
            placeholder="Rechercher un produit…"
            className="search-input pl-10"
          />
        </div>
        <select
          value={categoryId ?? ""}
          onChange={(e) => { setCategoryId(e.target.value || undefined); setPage(1); }}
          className="input-field max-w-[200px]"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
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

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId, { onSettled: () => setDeleteId(null) });
        }}
        title="Supprimer le produit"
        description="Cette action est irréversible. Le produit et ses données associées seront définitivement supprimés."
        confirmLabel="Supprimer"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
