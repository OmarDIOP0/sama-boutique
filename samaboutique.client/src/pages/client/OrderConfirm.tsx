import { Link, useSearchParams, useLocation } from "react-router-dom";
import { Check, ShoppingBag, Home, Package, Printer } from "lucide-react";
import { formatPrice, formatDateTime } from "@/lib/utils";
import type { Order } from "@/types";

export default function OrderConfirm() {
  const [params] = useSearchParams();
  const { state } = useLocation() as { state?: { order?: Order } };
  const reference = params.get("ref");
  const order = state?.order;

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      {/* Header succès */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-3xl bg-success/10 flex items-center justify-center mx-auto mb-5">
          <Check className="w-10 h-10 text-success" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Commande confirmée !</h1>
        <p className="text-muted-foreground text-sm">
          Merci pour votre commande. Nous la traitons dès maintenant.
        </p>
        {reference && (
          <p className="mt-3 text-sm font-medium">
            Référence :{" "}
            <span className="font-mono text-primary font-bold">{reference}</span>
          </p>
        )}
      </div>

      {/* Reçu */}
      {order && (
        <div className="card-glass rounded-2xl overflow-hidden mb-6 print:shadow-none">
          {/* En-tête reçu */}
          <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Détail de la commande
            </p>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors print:hidden"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimer
            </button>
          </div>

          {/* Articles */}
          <div className="px-5 py-4 space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-muted-foreground/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.productNom}</p>
                  {item.variante && (
                    <p className="text-xs text-muted-foreground">{item.variante}</p>
                  )}
                  <p className="text-xs text-muted-foreground">×{item.quantite}</p>
                </div>
                <span className="text-sm font-semibold flex-shrink-0">
                  {formatPrice(item.sousTotal)}
                </span>
              </div>
            ))}
          </div>

          {/* Totaux */}
          <div className="px-5 py-4 border-t border-border/50 space-y-1.5">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Sous-total</span>
              <span>{formatPrice(order.totalHT)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-foreground pt-1 border-t border-border/30 mt-1">
              <span>Total</span>
              <span className="text-primary">{formatPrice(order.totalTTC)}</span>
            </div>
          </div>

          {/* Infos livraison */}
          {(order.adresseLivraison || order.modePaiement) && (
            <div className="px-5 py-4 border-t border-border/50 space-y-2 bg-muted/20">
              {order.adresseLivraison && (
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Livraison :</span>
                  <span>{order.adresseLivraison}</span>
                </div>
              )}
              {order.modePaiement && (
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Paiement :</span>
                  <span>{order.modePaiement}</span>
                </div>
              )}
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Date :</span>
                <span>{formatDateTime(order.createdAt)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 justify-center print:hidden">
        <Link
          to="/compte"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-2xl text-sm font-semibold hover:opacity-90 btn-lift transition-all"
        >
          <ShoppingBag className="w-4 h-4" />
          Suivre ma commande
        </Link>
        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-2.5 bg-card border border-border/60 text-foreground rounded-2xl text-sm font-semibold hover:bg-muted transition-all"
        >
          <Home className="w-4 h-4" />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
