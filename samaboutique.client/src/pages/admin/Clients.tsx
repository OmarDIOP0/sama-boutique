import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Trash2, Eye, Phone, Crown, Medal, Award } from "lucide-react";
import { toast } from "sonner";
import { useClients, useDeleteClient } from "@/hooks/useClients";
import { DataTable, type Column } from "@/components/shared/DataTable";
import { AdminPageHeader, AdminSearchInput, AdminConfirmDialog } from "@/components/admin/ui";
import { formatPrice, debounce } from "@/lib/utils";
import type { Client } from "@/types";

const GOLD = "#C7932D";
const DARK = "#513102";

// Couleur d'avatar générée depuis le nom (palette chaude)
const AVATAR_COLORS = [
  { bg: "rgba(199,147,45,0.14)", fg: "#C7932D" },
  { bg: "rgba(45,122,79,0.12)", fg: "#2D7A4F" },
  { bg: "rgba(37,99,235,0.12)", fg: "#2563EB" },
  { bg: "rgba(168,85,247,0.12)", fg: "#A855F7" },
  { bg: "rgba(220,38,38,0.10)", fg: "#DC2626" },
  { bg: "rgba(81,49,2,0.10)", fg: "#513102" },
];
function avatarColor(nom: string) {
  let h = 0;
  for (let i = 0; i < nom.length; i++) h = nom.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// Niveau fidélité selon le total dépensé
function fidelityTier(total: number) {
  if (total >= 100000) return { label: "Gold", icon: Crown, bg: "rgba(199,147,45,0.14)", fg: "#C7932D" };
  if (total >= 30000) return { label: "Silver", icon: Medal, bg: "rgba(148,163,184,0.18)", fg: "#64748B" };
  return { label: "Bronze", icon: Award, bg: "rgba(180,120,80,0.14)", fg: "#A06A3C" };
}

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
      key: "nom", header: "Client",
      render: (row) => {
        const c = avatarColor(row.nom);
        return (
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: c.bg, color: c.fg, fontSize: 15, fontWeight: 700 }}>
              {row.nom[0].toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 14.5, fontWeight: 600, color: DARK }}>{row.nom}</p>
              {row.telephone && (
                <p className="flex items-center gap-1" style={{ fontSize: 12.5, color: "rgba(81,49,2,0.50)", marginTop: 1 }}>
                  <Phone className="w-3 h-3" /> {row.telephone}
                </p>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: "nbAchats", header: "Commandes",
      render: (row) => <span style={{ fontSize: 14, fontWeight: 600, color: DARK }}>{row.nbAchats ?? 0}</span>,
    },
    {
      key: "totalDepense", header: "Total achats",
      render: (row) => <span style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>{formatPrice(row.totalDepense)}</span>,
    },
    {
      key: "fidelite", header: "Fidélité",
      render: (row) => {
        const t = fidelityTier(row.totalDepense);
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: t.bg, color: t.fg, fontSize: 12, fontWeight: 600 }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </span>
        );
      },
    },
    {
      key: "pointsFidelite", header: "Points",
      render: (row) => <span style={{ fontSize: 13.5, fontWeight: 600, color: GOLD }}>{row.pointsFidelite} pts</span>,
    },
    {
      key: "actions", header: "", className: "w-20",
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/clients/${row.id}`); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: "rgba(81,49,2,0.55)", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(199,147,45,0.10)"; (e.currentTarget as HTMLElement).style.color = GOLD; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(81,49,2,0.55)"; }}
            title="Voir le profil" aria-label="Voir le profil">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteId(row.id); }}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: "rgba(81,49,2,0.55)", cursor: "pointer" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.10)"; (e.currentTarget as HTMLElement).style.color = "#DC2626"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(81,49,2,0.55)"; }}
            title="Supprimer" aria-label="Supprimer">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-[1600px]">
      <AdminPageHeader icon={Users} iconColor="purple" title="Clients" subtitle="Gérez votre base clients" />

      <AdminSearchInput
        value={search}
        onChange={(v) => { setSearch(v); handleSearch(v); }}
        placeholder="Rechercher par nom ou téléphone…"
        className="max-w-sm"
      />

      <DataTable
        columns={columns}
        data={data?.data ?? []}
        pagination={data?.pagination}
        onPageChange={setPage}
        loading={isLoading}
        onRowClick={(row) => navigate(`/admin/clients/${row.id}`)}
        emptyTitle="Aucun client"
        emptyDescription="Les clients apparaîtront ici après leur première commande"
      />

      <AdminConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId, {
            onSuccess: () => toast.success("Client supprimé"),
            onError: (e) => toast.error((e as Error).message),
            onSettled: () => setDeleteId(null),
          });
        }}
        title="Supprimer le client"
        description="Cette action est irréversible. Le client et son historique seront définitivement supprimés."
        confirmLabel="Supprimer"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
