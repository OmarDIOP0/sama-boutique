import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, ImagePlus } from "lucide-react";
import { productUpdateSchema, type ProductUpdateFormData } from "@/lib/validators";
import { useProduct, useUpdateProduct, useCategories, useUploadProductPhoto, useDeleteProductPhoto } from "@/hooks/useProducts";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PhotoUploader } from "@/components/shared/PhotoUploader";
import { cn } from "@/lib/utils";

// ── Composant section avec barre accent ───────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border/50">
        <div className="w-1.5 h-6 rounded-full" style={{ background: "var(--sama-terra)" }} />
        <h3
          className="text-base font-bold text-foreground"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: product, isLoading } = useProduct(id);
  const updateMutation = useUpdateProduct();
  const uploadMutation = useUploadProductPhoto();
  const deletePhotoMutation = useDeleteProductPhoto();
  const { data: categories = [] } = useCategories();
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductUpdateFormData>({
    resolver: zodResolver(productUpdateSchema),
    defaultValues: { statut: "Actif" },
  });

  useEffect(() => {
    if (product) {
      reset({
        nom: product.nom,
        description: product.description ?? "",
        prixAchat: product.prixAchat,
        prixVente: product.prixVente,
        prixPromo: product.prixPromo ?? undefined,
        categoryId: product.categoryId,
        statut: product.statut as "Actif" | "Inactif" | "Archivé",
        codeBarres: product.codeBarres ?? "",
      });
    }
  }, [product, reset]);

  const onSubmit = (data: ProductUpdateFormData) => {
    if (!id) return;
    updateMutation.mutate(
      { id, ...data },
      { onSuccess: () => navigate("/admin/products") }
    );
  };

  if (isLoading) return <LoadingSkeleton variant="page" />;

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
          <h1
            className="text-3xl font-bold text-foreground"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {product ? `Modifier : ${product.nom}` : "Modifier le produit"}
          </h1>
          <p className="text-base text-muted-foreground mt-0.5">Mettez à jour les informations du produit</p>
        </div>
      </div>

      {updateMutation.error && (
        <div className="mb-5 p-3.5 rounded-xl bg-danger/8 border border-danger/20 text-sm text-danger">
          {(updateMutation.error as Error).message}
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
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2.5">
                    Nom du produit *
                  </label>
                  <input
                    {...register("nom")}
                    className={cn("input-field", errors.nom && "border-danger/60")}
                    placeholder="Ex : T-shirt Premium coton"
                  />
                  {errors.nom && <p className="mt-1 text-xs text-danger">{errors.nom.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2.5">
                    Prix d'achat (XOF) *
                  </label>
                  <input
                    {...register("prixAchat")}
                    type="number"
                    step="any"
                    className={cn("input-field", errors.prixAchat && "border-danger/60")}
                    placeholder="0"
                  />
                  {errors.prixAchat && <p className="mt-1 text-xs text-danger">{errors.prixAchat.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2.5">
                    Prix de vente (XOF) *
                  </label>
                  <input
                    {...register("prixVente")}
                    type="number"
                    step="any"
                    className={cn("input-field", errors.prixVente && "border-danger/60")}
                    placeholder="0"
                  />
                  {errors.prixVente && <p className="mt-1 text-xs text-danger">{errors.prixVente.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest mb-2.5" style={{ color: "#C7932D" }}>
                    Prix promo (XOF)
                  </label>
                  <input
                    {...register("prixPromo")}
                    type="number"
                    step="any"
                    className="input-field"
                    style={{ borderColor: "rgba(199,147,45,0.4)" }}
                    placeholder="Laisser vide = pas de promo"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">Doit être inférieur au prix de vente. Affiche un prix barré sur la boutique.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2.5">
                    Catégorie *
                  </label>
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
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2.5">
                    Code-barres
                  </label>
                  <input {...register("codeBarres")} className="input-field" placeholder="EAN-13…" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2.5">
                    Statut
                  </label>
                  <select {...register("statut")} className="input-field">
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                    <option value="Archivé">Archivé</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2.5">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Description du produit…"
                  />
                </div>
              </div>
            </Section>

            {/* Variantes (lecture seule) */}
            {product && product.variants.length > 0 && (
              <Section title={`Variantes (${product.variants.length})`}>
                <div className="space-y-2">
                  {product.variants.map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-border/50 bg-muted/20"
                    >
                      <span className="text-xs font-semibold text-foreground">
                        {[v.taille, v.couleur].filter(Boolean).join(" / ") || "Standard"}
                      </span>
                      <div className="flex items-center gap-5 text-xs text-muted-foreground">
                        <span>
                          Stock :{" "}
                          <strong className={v.isRupture ? "text-danger" : "text-foreground"}>
                            {v.stockActuel}
                          </strong>
                        </span>
                        <span>
                          Prix :{" "}
                          <strong className="text-foreground">
                            {v.prix.toLocaleString("fr-FR")} XOF
                          </strong>
                        </span>
                        {v.isStockCritical && !v.isRupture && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ background: "rgba(196,168,45,0.12)", color: "var(--sama-gold)" }}>
                            Stock bas
                          </span>
                        )}
                        {v.isRupture && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-danger/10 text-danger">
                            Rupture
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  Les variantes sont gérées séparément depuis la page Stock.
                </p>
              </Section>
            )}
          </div>

          {/* Colonne droite — Photos */}
          <div className="space-y-5">
            <Section title="Photos du produit">
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                <ImagePlus className="w-3.5 h-3.5" />
                Ajoutez ou supprimez des photos
              </p>
              <PhotoUploader
                savedPhotos={product?.photos ?? []}
                onFilesSelected={(files) => {
                  if (!id) return;
                  files.forEach((file) => uploadMutation.mutate({ id, file }));
                }}
                onSavedRemove={(url) => {
                  if (!id) return;
                  setDeletingUrl(url);
                  deletePhotoMutation.mutate(
                    { id, photoUrl: url },
                    { onSettled: () => setDeletingUrl(null) }
                  );
                }}
                deletingUrl={deletingUrl}
                uploading={uploadMutation.isPending}
              />
            </Section>

            {/* Aide */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-5 space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aide</h3>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span style={{ color: "var(--sama-terra)" }}>•</span>
                  Le <strong>prix d'achat</strong> est confidentiel, il sert au calcul de marge.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "var(--sama-terra)" }}>•</span>
                  Le <strong>prix de vente</strong> est affiché aux clients.
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: "var(--sama-terra)" }}>•</span>
                  Les <strong>variantes</strong> et leur stock se gèrent depuis la page Stock.
                </li>
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
            disabled={updateMutation.isPending || uploadMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 btn-lift disabled:opacity-50 transition-all"
            style={{ background: "var(--sama-terra)" }}
          >
            {(updateMutation.isPending || uploadMutation.isPending) && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Sauvegarder
          </button>
        </div>
      </form>
    </div>
  );
}
