import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Package, Plus, Trash2, ArrowLeft, Loader2, ImagePlus } from "lucide-react";
import { productCreateSchema, type ProductCreateFormData } from "@/lib/validators";
import { useCreateProduct, useCategories, useUploadProductPhoto } from "@/hooks/useProducts";
import { PhotoUploader, type PendingPhoto } from "@/components/shared/PhotoUploader";
import { cn } from "@/lib/utils";

// ── Composant section avec barre accent ───────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border/50">
        <div className="w-1.5 h-6 rounded-full" style={{ background: "var(--sama-terra)" }} />
        <h3 className="text-base font-bold text-foreground"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          {title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function ProductNew() {
  const navigate = useNavigate();
  const createMutation = useCreateProduct();
  const uploadMutation = useUploadProductPhoto();
  const { data: categories = [] } = useCategories();
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProductCreateFormData>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: { statut: "Actif", variants: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  const onSubmit = async (data: ProductCreateFormData) => {
    createMutation.mutate(data, {
      onSuccess: async (res) => {
        const productId = (res as any)?.data?.data?.id as string | undefined;
        if (productId && pendingPhotos.length > 0) {
          // Upload all photos in parallel instead of sequentially
          await Promise.all(
            pendingPhotos.map((pending) =>
              uploadMutation.mutateAsync({ id: productId, file: pending.file }).catch(() => {})
            )
          );
          pendingPhotos.forEach((p) => URL.revokeObjectURL(p.previewUrl));
        }
        navigate("/admin/products");
      },
    });
  };

  return (
    <div className="p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-foreground"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Nouveau produit
          </h1>
          <p className="text-base text-muted-foreground mt-0.5">Ajoutez un produit à votre catalogue</p>
        </div>
      </div>

      {createMutation.error && (
        <div className="mb-5 p-3.5 rounded-xl bg-danger/8 border border-danger/20 text-sm text-danger">
          {(createMutation.error as Error).message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Layout 2 colonnes */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">

          {/* Colonne gauche */}
          <div className="space-y-5">

            {/* Infos générales */}
            <Section title="Informations générales">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Nom du produit *</label>
                  <input
                    {...register("nom")}
                    className={cn("input-field", errors.nom && "border-danger/60")}
                    placeholder="Ex : T-shirt Premium coton"
                  />
                  {errors.nom && <p className="mt-1 text-xs text-danger">{errors.nom.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Prix d'achat (XOF) *</label>
                  <input
                    {...register("prixAchat")}
                    type="number" step="any"
                    className={cn("input-field", errors.prixAchat && "border-danger/60")}
                    placeholder="0"
                  />
                  {errors.prixAchat && <p className="mt-1 text-xs text-danger">{errors.prixAchat.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Prix de vente (XOF) *</label>
                  <input
                    {...register("prixVente")}
                    type="number" step="any"
                    className={cn("input-field", errors.prixVente && "border-danger/60")}
                    placeholder="0"
                  />
                  {errors.prixVente && <p className="mt-1 text-xs text-danger">{errors.prixVente.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Catégorie *</label>
                  <select
                    {...register("categoryId")}
                    className={cn("input-field", errors.categoryId && "border-danger/60")}
                  >
                    <option value="">Sélectionner…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                  {errors.categoryId && <p className="mt-1 text-xs text-danger">{errors.categoryId.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Code-barres</label>
                  <input {...register("codeBarres")} className="input-field" placeholder="EAN-13…" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Statut</label>
                  <select {...register("statut")} className="input-field">
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                    <option value="Archivé">Archivé</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Description</label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Description du produit…"
                  />
                </div>
              </div>
            </Section>

            {/* Variantes */}
            <Section title="Variantes">
              <div className="space-y-3">
                {fields.length === 0 ? (
                  <div className="py-6 text-center rounded-xl border border-dashed border-border/60">
                    <p className="text-sm text-muted-foreground">Aucune variante — le produit sera vendu tel quel</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Ajoutez des variantes pour gérer tailles et couleurs</p>
                  </div>
                ) : (
                  fields.map((field, i) => (
                    <div key={field.id}
                      className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl border border-border/50 bg-muted/20 relative">
                      {[
                        { label: "Taille", name: `variants.${i}.taille` as const, placeholder: "S, M, XL…" },
                        { label: "Couleur", name: `variants.${i}.couleur` as const, placeholder: "Noir…" },
                      ].map(({ label, name, placeholder }) => (
                        <div key={label}>
                          <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
                          <input {...register(name)} className="input-field text-xs" placeholder={placeholder} />
                        </div>
                      ))}
                      <div>
                        <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Stock init.</label>
                        <input {...register(`variants.${i}.stockActuel`)} type="number" className="input-field text-xs" placeholder="0" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Stock min.</label>
                        <input {...register(`variants.${i}.stockMinimum`)} type="number" className="input-field text-xs" placeholder="5" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Prix (XOF)</label>
                        <input {...register(`variants.${i}.prixOverride`)} type="number" step="any" className="input-field text-xs" placeholder="Auto" />
                      </div>
                      <button type="button" onClick={() => remove(i)}
                        className="absolute top-2.5 right-2.5 w-6 h-6 rounded-lg hover:bg-danger/10 flex items-center justify-center text-muted-foreground hover:text-danger transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}

                <button
                  type="button"
                  onClick={() => append({ taille: "", couleur: "", stockActuel: 0, stockMinimum: 5 })}
                  className="w-full h-9 rounded-xl border border-dashed text-xs font-semibold flex items-center justify-center gap-1.5 transition-all hover:opacity-80"
                  style={{ borderColor: "var(--sama-terra)", color: "var(--sama-terra)", background: "var(--sama-terra-light, rgba(196,98,45,0.06))" }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter une variante
                </button>
              </div>
            </Section>
          </div>

          {/* Colonne droite — Photos */}
          <div className="space-y-5">
            <Section title="Photos du produit">
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                <ImagePlus className="w-3.5 h-3.5" />
                Uploadées après la création
              </p>
              <PhotoUploader
                pendingPhotos={pendingPhotos}
                onFilesSelected={(files) => {
                  const newItems: PendingPhoto[] = files.map((file) => ({
                    file,
                    previewUrl: URL.createObjectURL(file),
                  }));
                  setPendingPhotos((prev) => [...prev, ...newItems]);
                }}
                onPendingRemove={(i) => {
                  setPendingPhotos((prev) => {
                    URL.revokeObjectURL(prev[i].previewUrl);
                    return prev.filter((_, idx) => idx !== i);
                  });
                }}
                uploading={uploadMutation.isPending}
              />
            </Section>

            {/* Résumé prix */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-5 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aide</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2"><span style={{ color: "var(--sama-terra)" }}>•</span> Le <strong>prix d'achat</strong> est confidentiel, il sert au calcul de marge.</li>
                <li className="flex items-start gap-2"><span style={{ color: "var(--sama-terra)" }}>•</span> Le <strong>prix de vente</strong> est affiché aux clients.</li>
                <li className="flex items-start gap-2"><span style={{ color: "var(--sama-terra)" }}>•</span> Le <strong>prix override</strong> d'une variante remplace le prix de vente pour cette variante.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-border/50">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 rounded-xl border border-input text-sm font-medium hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending || uploadMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 btn-lift disabled:opacity-50 transition-all"
            style={{ background: "var(--sama-terra)" }}
          >
            {(createMutation.isPending || uploadMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
            Créer le produit
          </button>
        </div>
      </form>
    </div>
  );
}
