import { useState } from "react";
import { Tag, Plus, Trash2, X, Loader2, ChevronRight, Pencil } from "lucide-react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/useProducts";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2.5">
      {children}
    </label>
  );
}

// Shared modal form content
function CategoryForm({
  nom, onNomChange,
  parentId, onParentIdChange,
  ordre, onOrdreChange,
  categories,
  excludeId,
  nomError,
  error,
  isPending,
  submitLabel,
  onCancel,
}: {
  nom: string; onNomChange: (v: string) => void;
  parentId: string; onParentIdChange: (v: string) => void;
  ordre: number; onOrdreChange: (v: number) => void;
  categories: Category[];
  excludeId?: string;
  nomError: string;
  error?: Error | null;
  isPending: boolean;
  submitLabel: string;
  onCancel: () => void;
}) {
  return (
    <>
      <div className="p-6 space-y-5">
        <div>
          <FieldLabel>Nom de la catégorie *</FieldLabel>
          <input
            value={nom}
            onChange={(e) => onNomChange(e.target.value)}
            className={cn("input-field", nomError && "border-danger/60")}
            placeholder="Ex : Vêtements, Chaussures, Accessoires…"
            autoFocus
          />
          {nomError && <p className="mt-1.5 text-xs text-danger">{nomError}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Catégorie parente</FieldLabel>
            <select value={parentId} onChange={(e) => onParentIdChange(e.target.value)} className="input-field">
              <option value="">Aucune (racine)</option>
              {categories
                .filter((c) => c.id !== excludeId)
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
            </select>
          </div>

          <div>
            <FieldLabel>Ordre d'affichage</FieldLabel>
            <input
              type="number"
              min={0}
              value={ordre}
              onChange={(e) => onOrdreChange(Number(e.target.value))}
              className="input-field"
              placeholder="0"
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-danger/8 border border-danger/20 text-sm text-danger">
            {(error as Error).message}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 justify-end px-6 py-4 border-t border-border/50 bg-muted/20">
        <button type="button" onClick={onCancel} className="btn-outline">
          Annuler
        </button>
        <button type="submit" disabled={isPending} className="btn-terra">
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </>
  );
}

export default function Categories() {
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [nom, setNom] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [ordre, setOrdre] = useState<number>(0);
  const [nomError, setNomError] = useState("");

  const { data: categories = [], isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const roots = categories.filter((c) => !c.parentId);

  const openCreate = () => {
    setNom(""); setParentId(""); setOrdre(0); setNomError("");
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditCat(cat);
    setNom(cat.nom);
    setParentId(cat.parentId ?? "");
    setOrdre(cat.ordre);
    setNomError("");
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (nom.trim().length < 2) { setNomError("Le nom doit contenir au moins 2 caractères"); return; }
    createMutation.mutate(
      { nom: nom.trim(), parentId: parentId || undefined, ordre },
      { onSuccess: () => setShowModal(false) }
    );
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCat) return;
    if (nom.trim().length < 2) { setNomError("Le nom doit contenir au moins 2 caractères"); return; }
    updateMutation.mutate(
      { id: editCat.id, nom: nom.trim(), parentId: parentId || undefined, ordre },
      { onSuccess: () => setEditCat(null) }
    );
  };

  const CategoryRow = ({ cat, depth = 0 }: { cat: Category; depth?: number }) => (
    <>
      <tr className="border-b border-border/30 hover:bg-muted/20 transition-colors group">
        <td className="px-5 py-3.5">
          <div className="flex items-center gap-2.5" style={{ paddingLeft: `${depth * 24}px` }}>
            {depth > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--sama-terra-light)" }}
            >
              <Tag className="w-3.5 h-3.5" style={{ color: "var(--sama-terra)" }} />
            </div>
            <span className="text-sm font-semibold text-foreground">{cat.nom}</span>
          </div>
        </td>
        <td className="px-5 py-3.5">
          <span className="text-xs text-muted-foreground">
            {cat.parentNom ?? <span className="italic">Racine</span>}
          </span>
        </td>
        <td className="px-5 py-3.5 text-center">
          <span className="text-sm text-muted-foreground font-mono">{cat.ordre}</span>
        </td>
        <td className="px-5 py-3.5 text-center">
          <span
            className={cn(
              "inline-flex px-2.5 py-1 rounded-full text-xs font-semibold",
              cat.nbProduits > 0
                ? "text-white"
                : "bg-muted text-muted-foreground"
            )}
            style={cat.nbProduits > 0 ? { background: "var(--sama-terra)", opacity: 0.9 } : undefined}
          >
            {cat.nbProduits} produit{cat.nbProduits !== 1 ? "s" : ""}
          </span>
        </td>
        <td className="px-5 py-3.5 text-right">
          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => openEdit(cat)}
              title="Modifier"
              className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeleteId(cat.id)}
              disabled={cat.nbProduits > 0}
              title={cat.nbProduits > 0 ? "Impossible : des produits sont liés" : "Supprimer"}
              className="w-8 h-8 rounded-xl hover:bg-danger/10 flex items-center justify-center text-muted-foreground hover:text-danger transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
      {cat.subCategories?.map((sub) => (
        <CategoryRow key={sub.id} cat={sub} depth={depth + 1} />
      ))}
    </>
  );

  return (
    <div className="p-6 space-y-5">
      <PageHeader icon={Tag} title="Catégories" description="Organisez vos produits par catégorie">
        <button onClick={openCreate} className="btn-terra">
          <Plus className="w-4 h-4" />
          Nouvelle catégorie
        </button>
      </PageHeader>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <LoadingSkeleton key={i} variant="row" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="py-20 text-center">
            <div
              className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
              style={{ background: "var(--sama-terra-light)" }}
            >
              <Tag className="w-7 h-7" style={{ color: "var(--sama-terra)" }} />
            </div>
            <p className="text-base font-semibold text-foreground">Aucune catégorie</p>
            <p className="text-sm text-muted-foreground mt-1">Créez votre première catégorie pour organiser vos produits</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nom</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Parent</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ordre</th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Produits</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {roots.map((cat) => (
                <CategoryRow key={cat.id} cat={cat} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border/50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full" style={{ background: "var(--sama-terra)" }} />
                <h3 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Nouvelle catégorie
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <CategoryForm
                nom={nom} onNomChange={(v) => { setNom(v); setNomError(""); }}
                parentId={parentId} onParentIdChange={setParentId}
                ordre={ordre} onOrdreChange={setOrdre}
                categories={categories}
                nomError={nomError}
                error={createMutation.error as Error | null}
                isPending={createMutation.isPending}
                submitLabel="Créer la catégorie"
                onCancel={() => setShowModal(false)}
              />
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditCat(null)} />
          <div className="relative bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border/50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full" style={{ background: "var(--sama-terra)" }} />
                <h3 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Modifier : {editCat.nom}
                </h3>
              </div>
              <button onClick={() => setEditCat(null)} className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdate}>
              <CategoryForm
                nom={nom} onNomChange={(v) => { setNom(v); setNomError(""); }}
                parentId={parentId} onParentIdChange={setParentId}
                ordre={ordre} onOrdreChange={setOrdre}
                categories={categories}
                excludeId={editCat.id}
                nomError={nomError}
                error={updateMutation.error as Error | null}
                isPending={updateMutation.isPending}
                submitLabel="Sauvegarder"
                onCancel={() => setEditCat(null)}
              />
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId, { onSettled: () => setDeleteId(null) });
        }}
        title="Supprimer la catégorie"
        description="Cette action est irréversible. Les produits liés ne seront pas supprimés."
        confirmLabel="Supprimer"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
