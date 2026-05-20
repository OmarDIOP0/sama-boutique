import { Link } from "react-router-dom";
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, Package } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { formatPrice, cn } from "@/lib/utils";

export default function Cart() {
  const cart = useCartStore();

  if (cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-10 h-10 text-muted-foreground/40" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Votre panier est vide</h1>
        <p className="text-muted-foreground mb-8">
          Découvrez notre catalogue et ajoutez des articles à votre panier.
        </p>
        <Link
          to="/catalogue"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-semibold text-sm hover:opacity-90 btn-lift transition-all"
        >
          Découvrir le catalogue
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Votre panier</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.items.map((item) => (
            <div
              key={item.variantId}
              className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border/60"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.productNom} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{item.productNom}</p>
                <p className="text-xs text-muted-foreground">{item.variantInfo}</p>
                <p className="font-bold text-primary text-sm mt-1">
                  {formatPrice(item.prixUnitaire * item.quantite)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 border border-border/60 rounded-xl p-0.5">
                  <button
                    onClick={() => cart.updateQuantity(item.variantId, item.quantite - 1)}
                    className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantite}</span>
                  <button
                    onClick={() => cart.updateQuantity(item.variantId, item.quantite + 1)}
                    className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={() => cart.removeItem(item.variantId)}
                  className="w-8 h-8 rounded-xl hover:bg-danger/10 flex items-center justify-center text-muted-foreground hover:text-danger transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card-glass rounded-2xl p-5 sticky top-20">
            <h3 className="font-semibold mb-4">Récapitulatif</h3>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{formatPrice(cart.subtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Livraison</span>
                <span className="text-success font-medium">Calculée à l'étape suivante</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-border/60 text-base">
                <span>Total</span>
                <span className="text-primary">{formatPrice(cart.total())}</span>
              </div>
            </div>
            <Link
              to="/checkout"
              className="w-full flex items-center justify-center gap-2 h-11 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 btn-lift transition-all"
            >
              Commander
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/catalogue"
              className="w-full flex items-center justify-center mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
