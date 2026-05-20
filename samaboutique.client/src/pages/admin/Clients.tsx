import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, Trash2, Eye } from "lucide-react";
import { useClients, useDeleteClient } from "@/hooks/useClients";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { statusColor, formatPrice, formatDate, cn, debounce } from "@/lib/utils";
import type { Client } from "@/types";

export default function Clients() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useClients({ page, pageSize: 15, search: debouncedSearch || undefined });
  const deleteMutation = useDeleteClient();

  const handleSearch = useCallback(
    debounce((val: string) => { setDebouncedSearch(val); setPage(1); }, 300),
    []
  );

  const columns: Column<Client>[] = [
    {
      key: "nom",
      header: "Client",
      render: (row) => (
        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
            style={{ background: "var(--sama-terra-light)", color: "var(--sama-terra)" }}
          >
            {row.nom[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{row.nom}</p>
            {row.email && <p className="text-xs text-muted-foreground mt-0.5">{row.email}</p>}
          </div>
        </div>
      ),
    },
    {
      key: "telephone",
      header: "Téléphone",
      render: (row) => (
        <span className="text-sm text-muted-foreground">{row.telephone ?? "—"}</span>
      ),
    },
    {
      key: "segment",
      header: "Segment",
      render: (row) => (
        <span className={cn("inline-flex px-2.5 py-1 rounded-full text-xs font-semibold", statusColor(row.segment))}>
          {row.segment}
        </span>
      ),
    },
    {
      key: "totalDepense",
      header: "Total achats",
      render: (row) => (
        <span className="font-bold text-sm text-foreground">{formatPrice(row.totalDepense)}</span>
      ),
    },
    {
      key: "pointsFidelite",
      header: "Points fidélité",
      render: (row) => (
        <span className="text-sm font-semibold" style={{ color: "var(--sama-gold)" }}>
          {row.pointsFidelite} pts
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-20",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/admin/clients/${row.id}`); }}
            className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Voir le profil"
          >
            <Eye className="w-4 h-4" />
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
      <PageHeader icon={Users} title="Clients" description="Gérez votre base clients" />

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); handleSearch(e.target.value); }}
          placeholder="Rechercher un client…"
          className="search-input pl-10"
        />
      </div>

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        pagination={data?.pagination}
        onPageChange={setPage}
        loading={isLoading}
        onRowClick={(row) => navigate(`/admin/clients/${row.id}`)}
        emptyTitle="Aucun client"
        emptyDescription="Ajoutez des clients pour commencer"
      />

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId, { onSettled: () => setDeleteId(null) });
        }}
        title="Supprimer le client"
        description="Cette action est irréversible. Le client et son historique seront définitivement supprimés."
        confirmLabel="Supprimer"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
