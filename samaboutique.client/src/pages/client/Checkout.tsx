import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Loader2, Package } from "lucide-react";
import { checkoutSchema, type CheckoutFormData } from "@/lib/validators";
import { useCreateOrder } from "@/hooks/useOrders";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import { formatPrice, cn } from "@/lib/utils";

export default function Checkout() {
  const navigate = useNavigate();
  const cart = useCartStore();
  const { user } = useAuthStore();
  const createOrderMutation = useCreateOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      nom: user?.nom ?? "",
      email: user?.email ?? "",
      telephone: "",
      adresse: "",
    },
  });

  const clientId = user?.clientId ?? "";

  const onSubmit = (data: CheckoutFormData) => {
    if (!clientId) return;
    createOrderMutation.mutate(
      {
        clientId,
        adresseLivraison: data.adresse,
        modePaiement: "CarteBancaire",
        items: cart.items.map((item) => ({
          variantId: item.variantId,
          quantite: item.quantite,
          prixUnitaire: item.prixUnitaire,
        })),
      },
      {
        onSuccess: (order) => {
          cart.clearCart();
          navigate(`/commande/confirmation?ref=${order?.numeroFacture ?? order?.id ?? ""}`, { state: { order } });
        },
      }
    );
  };

  if (cart.items.length === 0) {
    navigate("/panier");
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Finaliser la commande</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-5">
          <div className="card-glass rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold">Informations de livraison</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: "nom" as const, label: "Nom complet *", type: "text" },
                { name: "email" as const, label: "Email *", type: "email" },
                { name: "telephone" as const, label: "Téléphone *", type: "tel" },
              ].map(({ name, label, type }) => (
                <div key={name}>
                  <label className="block text-sm font-medium mb-1.5">{label}</label>
                  <input
                    {...register(name)}
                    type={type}
                    className={cn("input-field", errors[name] && "border-danger/60")}
                  />
                  {errors[name] && <p className="mt-1 text-xs text-danger">{errors[name]?.message}</p>}
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Adresse de livraison *</label>
                <textarea
                  {...register("adresse")}
                  rows={2}
                  className={cn("input-field resize-none", errors.adresse && "border-danger/60")}
                  placeholder="Rue, quartier, ville…"
                />
                {errors.adresse && <p className="mt-1 text-xs text-danger">{errors.adresse.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Notes (optionnel)</label>
                <textarea
                  {...register("notes")}
                  rows={2}
                  className="input-field resize-none"
                  placeholder="Instructions particulières…"
                />
              </div>
            </div>
          </div>

          {!clientId && (
            <div className="p-3 rounded-xl bg-warning/10 border border-warning/20">
              <p className="text-sm text-warning font-medium">Session expirée.</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Veuillez vous <a href="/login" className="underline font-medium">déconnecter et reconnecter</a> pour continuer.
              </p>
            </div>
          )}

          {createOrderMutation.error && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/20">
              <p className="text-sm text-danger">{(createOrderMutation.error as Error).message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={createOrderMutation.isPending || !clientId}
            className="w-full h-11 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 btn-lift disabled:opacity-50"
          >
            {createOrderMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Traitement…</>
            ) : (
              <><ShoppingBag className="w-4 h-4" /> Passer la commande</>
            )}
          </button>
        </form>

        {/* Order summary */}
        <div className="card-glass rounded-2xl p-5 h-fit sticky top-20">
          <h3 className="font-semibold mb-4">Votre commande</h3>
          <div className="space-y-3 mb-4">
            {cart.items.map((item) => (
              <div key={item.variantId} className="flex items-center gap-3 text-sm">
                <div className="w-10 h-10 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productNom} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-xs">{item.productNom}</p>
                  <p className="text-muted-foreground text-xs">×{item.quantite}</p>
                </div>
                <span className="font-semibold text-xs">{formatPrice(item.prixUnitaire * item.quantite)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between font-bold pt-3 border-t border-border/60">
            <span>Total</span>
            <span className="text-primary">{formatPrice(cart.total())}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
