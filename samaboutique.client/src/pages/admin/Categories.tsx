import { useState } from "react";
import { Tag, Plus, Trash2, Loader2, ChevronRight, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useProducts";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import {
  AdminPageHeader, AdminModal, AdminConfirmDialog, AdminEmptyState,
} from "@/components/admin/ui";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

const GOLD = "#C7932D";
const DARK = "#513102";

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

// Formulaire partagé création / édition
function CategoryForm({
  nom, onNomChange, parentId, onParentIdChange, ordre, onOrdreChange,
  categories, excludeId, nomError, error,
}: {
  nom: string; onNomChange: (v: string) => void;
  parentId: string; onParentIdChange: (v: string) => void;
  ordre: number; onOrdreChange: (v: number) => void;
  categories: Category[]; excludeId?: string; nomError: string; error?: Error | null;
}) {
  return (
    <div className="space-y-5">
      <div>
        <FieldLabel>Nom de la catégorie *</FieldLabel>
        <input
          value={nom}
          onChange={(e) => onNomChange(e.target.value)}
          style={inputStyle(!!nomError)}
          placeholder="Ex : Vêtements, Chaussures, Accessoires…"
          autoFocus
        />
        {nomError && <p className="mt-1.5" style={{ fontSize: 12, color: "#DC2626" }}>{nomError}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel>Catégorie parente</FieldLabel>
          <select value={parentId} onChange={(e) => onParentIdChange(e.target.value)} style={{ ...inputStyle(), cursor: "pointer" }}>
            <option value="">Aucune (racine)</option>
            {categories.filter((c) => c.id !== excludeId).map((c) => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>Ordre d'affichage</FieldLabel>
          <input type="number" min={0} value={ordre} onChange={(e) => onOrdreChange(Number(e.target.value))} style={inputStyle()} placeholder="0" />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <p style={{ fontSize: 13, color: "#DC2626" }}>{error.message}</p>
        </div>
      )}
    </div>
  );
}

export default function Categories() {
  const [showCreate, setShowCreate] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [nom, setNom] = useState("");
  const [parentId, setParentId] = useState("");
  const [ordre, setOrdre] = useState(0);
  const [nomError, setNomError] = useState("");

  const { data: categories = [], isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const roots = categories.filter((c) => !c.parentId);

  const openCreate = () => { setNom(""); setParentId(""); setOrdre(0); setNomError(""); setShowCreate(true); };
  const openEdit = (cat: Category) => { setEditCat(cat); setNom(cat.nom); setParentId(cat.parentId ?? ""); setOrdre(cat.ordre); setNomError(""); };

  const handleCreate = () => {
    if (nom.trim().length < 2) { setNomError("Le nom doit contenir au moins 2 caractères"); return; }
    createMutation.mutate(
      { nom: nom.trim(), parentId: parentId || undefined, ordre },
      { onSuccess: () => { setShowCreate(false); toast.success("Catégorie créée"); }, onError: (e) => toast.error((e as Error).message) }
    );
  };

  const handleUpdate = () => {
    if (!editCat) return;
    if (nom.trim().length < 2) { setNomError("Le nom doit contenir au moins 2 caractères"); return; }
    updateMutation.mutate(
      { id: editCat.id, nom: nom.trim(), parentId: parentId || undefined, ordre },
      { onSuccess: () => { setEditCat(null); toast.success("Catégorie mise à jour"); }, onError: (e) => toast.error((e as Error).message) }
    );
  };

  const CategoryRow = ({ cat, depth = 0 }: { cat: Category; depth?: number }) => (
    <>
      <tr className="group transition-colors" style={{ borderBottom: "1px solid rgba(81,49,2,0.05)" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(199,147,45,0.04)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2.5" style={{ paddingLeft: `${depth * 24}px` }}>
            {depth > 0 && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(81,49,2,0.30)" }} />}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(199,147,45,0.10)" }}>
              <Tag className="w-3.5 h-3.5" style={{ color: GOLD }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 600, color: DARK }}>{cat.nom}</span>
          </div>
        </td>
        <td className="px-5 py-3.5">
          <span style={{ fontSize: 13, color: "rgba(81,49,2,0.50)", fontStyle: cat.parentNom ? "normal" : "italic" }}>
            {cat.parentNom ?? "Racine"}
          </span>
        </td>
        <td className="px-5 py-3.5 text-center">
          <span className="font-mono" style={{ fontSize: 14, color: "rgba(81,49,2,0.55)" }}>{cat.ordre}</span>
        </td>
        <td className="px-5 py-3.5 text-center">
          <span className={cn("admin-badge", cat.nbProduits > 0 ? "admin-badge-warning" : "admin-badge-muted")}>
            {cat.nbProduits} produit{cat.nbProduits !== 1 ? "s" : ""}
          </span>
        </td>
        <td className="px-5 py-3.5 text-right">
          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => openEdit(cat)} title="Modifier" aria-label="Modifier"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ color: "rgba(81,49,2,0.55)", cursor: "pointer" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(199,147,45,0.10)"; (e.currentTarget as HTMLElement).style.color = GOLD; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(81,49,2,0.55)"; }}>
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => setDeleteId(cat.id)} disabled={cat.nbProduits > 0}
              title={cat.nbProduits > 0 ? "Impossible : des produits sont liés" : "Supprimer"} aria-label="Supprimer"
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors disabled:opacity-30"
              style={{ color: "rgba(81,49,2,0.55)", cursor: cat.nbProduits > 0 ? "not-allowed" : "pointer" }}
              onMouseEnter={(e) => { if (cat.nbProduits === 0) { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.10)"; (e.currentTarget as HTMLElement).style.color = "#DC2626"; } }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(81,49,2,0.55)"; }}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
      {cat.subCategories?.map((sub) => <CategoryRow key={sub.id} cat={sub} depth={depth + 1} />)}
    </>
  );

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-[1600px]">
      <AdminPageHeader icon={Tag} title="Catégories" subtitle="Organisez vos produits par catégorie">
        <button onClick={openCreate} className="admin-btn-gold">
          <Plus className="w-4 h-4" />
          Nouvelle catégorie
        </button>
      </AdminPageHeader>

      {/* Tree table */}
      <div className="admin-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <LoadingSkeleton key={i} variant="row" />)}
          </div>
        ) : categories.length === 0 ? (
          <AdminEmptyState icon={Tag} title="Aucune catégorie" description="Créez votre première catégorie pour organiser vos produits"
            action={<button onClick={openCreate} className="admin-btn-gold"><Plus className="w-4 h-4" /> Nouvelle catégorie</button>} />
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: "rgba(81,49,2,0.04)", borderBottom: "1px solid rgba(81,49,2,0.08)" }}>
                {["Nom", "Parent", "Ordre", "Produits", ""].map((h, i) => (
                  <th key={i} className={cn("px-5 py-3.5", i === 2 || i === 3 ? "text-center" : "text-left")}
                    style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(81,49,2,0.50)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roots.map((cat) => <CategoryRow key={cat.id} cat={cat} />)}
            </tbody>
          </table>
        )}
      </div>

      {/* Create modal */}
      <AdminModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        icon={Tag}
        title="Nouvelle catégorie"
        persistent={createMutation.isPending}
        footer={
          <>
            <button onClick={() => setShowCreate(false)} className="admin-btn-outline">Annuler</button>
            <button onClick={handleCreate} disabled={createMutation.isPending} className="admin-btn-gold">
              {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Créer la catégorie
            </button>
          </>
        }
      >
        <CategoryForm
          nom={nom} onNomChange={(v) => { setNom(v); setNomError(""); }}
          parentId={parentId} onParentIdChange={setParentId}
          ordre={ordre} onOrdreChange={setOrdre}
          categories={categories} nomError={nomError}
          error={createMutation.error as Error | null}
        />
      </AdminModal>

      {/* Edit modal */}
      <AdminModal
        open={!!editCat}
        onClose={() => setEditCat(null)}
        icon={Pencil}
        title={editCat ? `Modifier : ${editCat.nom}` : "Modifier"}
        persistent={updateMutation.isPending}
        footer={
          <>
            <button onClick={() => setEditCat(null)} className="admin-btn-outline">Annuler</button>
            <button onClick={handleUpdate} disabled={updateMutation.isPending} className="admin-btn-gold">
              {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Sauvegarder
            </button>
          </>
        }
      >
        <CategoryForm
          nom={nom} onNomChange={(v) => { setNom(v); setNomError(""); }}
          parentId={parentId} onParentIdChange={setParentId}
          ordre={ordre} onOrdreChange={setOrdre}
          categories={categories} excludeId={editCat?.id} nomError={nomError}
          error={updateMutation.error as Error | null}
        />
      </AdminModal>

      <AdminConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId, {
            onSuccess: () => toast.success("Catégorie supprimée"),
            onError: (e) => toast.error((e as Error).message),
            onSettled: () => setDeleteId(null),
          });
        }}
        title="Supprimer la catégorie"
        description="Cette action est irréversible. Les produits liés ne seront pas supprimés."
        confirmLabel="Supprimer"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
