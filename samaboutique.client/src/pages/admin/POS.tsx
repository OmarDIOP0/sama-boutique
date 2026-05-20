import { useState, useCallback, useRef } from "react";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Banknote,
  Smartphone,
  User,
  QrCode,
  X,
  Check,
  Loader2,
  Package,
  Percent,
  WifiOff,
} from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useCreateSale } from "@/hooks/useSales";
import { useClients } from "@/hooks/useClients";
import { useCartStore } from "@/stores/cart.store";
import { useUIStore } from "@/stores/ui.store";
import { formatPrice, debounce, cn } from "@/lib/utils";
import type { Product, PaymentMode, SaleCreateRequest } from "@/types";
import { enqueueOfflineSale } from "@/lib/offline-queue";

const PAYMENT_MODES: { value: PaymentMode; label: string; icon: React.ReactNode }[] = [
  { value: "Especes", label: "Espèces", icon: <Banknote className="w-4 h-4" /> },
  { value: "CarteBancaire", label: "Carte", icon: <CreditCard className="w-4 h-4" /> },
  { value: "MobileMoney", label: "Mobile", icon: <Smartphone className="w-4 h-4" /> },
];

// ─── QR Scanner Modal ────────────────────────────────────────────────────────
function QRScannerModal({ onClose, onResult }: { onClose: () => void; onResult: (code: string) => void }) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState("");

  const startScanner = useCallback(async () => {
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");
      setStarted(true);
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          scanner.stop().catch(() => {});
          onResult(decodedText);
          onClose();
        },
        undefined
      );
    } catch (e) {
      setError("Impossible d'accéder à la caméra");
    }
  }, [onResult, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative bg-card rounded-2xl overflow-hidden w-full max-w-sm border border-border/50 shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 rounded-full" style={{ background: "var(--sama-terra)" }} />
            <h3 className="font-bold text-sm" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Scanner un code
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">
          {!started ? (
            <div className="text-center py-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "var(--sama-terra-light)" }}
              >
                <QrCode className="w-7 h-7" style={{ color: "var(--sama-terra)" }} />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Activez la caméra pour scanner un QR code ou code-barres
              </p>
              <button onClick={startScanner} className="btn-terra mx-auto">
                Activer la caméra
              </button>
              {error && <p className="text-xs text-danger mt-2">{error}</p>}
            </div>
          ) : (
            <div className="relative">
              <div id="qr-reader" ref={scannerRef} className="w-full rounded-xl overflow-hidden" />
              <div className="absolute inset-0 pointer-events-none">
                {["tl", "tr", "bl", "br"].map((pos) => (
                  <div
                    key={pos}
                    className={cn(
                      "absolute w-8 h-8 scan-corner",
                      pos === "tl" && "top-6 left-6 border-t-2 border-l-2 rounded-tl-lg",
                      pos === "tr" && "top-6 right-6 border-t-2 border-r-2 rounded-tr-lg",
                      pos === "bl" && "bottom-6 left-6 border-b-2 border-l-2 rounded-bl-lg",
                      pos === "br" && "bottom-6 right-6 border-b-2 border-r-2 rounded-br-lg"
                    )}
                    style={{ borderColor: "var(--sama-terra)" }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Variant Picker Modal ────────────────────────────────────────────────────
function VariantPickerModal({
  product,
  onClose,
  onAdd,
}: {
  product: import("@/types").Product;
  onClose: () => void;
  onAdd: (variantId: string, qty: number) => void;
}) {
  const [selected, setSelected] = useState<string | null>(
    product.variants.find((v) => !v.isRupture)?.id ?? null
  );
  const [qty, setQty] = useState(1);

  const variant = product.variants.find((v) => v.id === selected);
  const prix = variant ? (variant.prix > 0 ? variant.prix : product.prixVente) : product.prixVente;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border/50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            {product.photos[0] ? (
              <img src={product.photos[0]} alt={product.nom} className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <Package className="w-5 h-5 text-muted-foreground/40" />
              </div>
            )}
            <div>
              <p className="font-bold text-sm" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {product.nom}
              </p>
              <p className="text-xs text-muted-foreground">{product.variants.length} variante(s)</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Variants list */}
        <div className="p-5 space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
          {product.variants.map((v) => {
            const vPrix = v.prix > 0 ? v.prix : product.prixVente;
            const label = [v.taille, v.couleur].filter(Boolean).join(" / ") || "Standard";
            const isSelected = selected === v.id;
            return (
              <button
                key={v.id}
                onClick={() => { if (!v.isRupture) { setSelected(v.id); setQty(1); } }}
                disabled={v.isRupture}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all",
                  v.isRupture && "opacity-40 cursor-not-allowed",
                )}
                style={
                  isSelected
                    ? { borderColor: "var(--sama-terra)", background: "var(--sama-terra-light)", color: "var(--sama-terra)" }
                    : undefined
                }
              >
                <div className="flex items-center gap-2">
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  <span className="font-semibold">{label}</span>
                  {v.isRupture && <span className="text-danger text-xs">Rupture</span>}
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="text-xs">Stock : <strong className={cn("text-foreground", v.isRupture && "text-danger")}>{v.stockActuel}</strong></span>
                  <span className="font-bold text-foreground">{formatPrice(vPrix)}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quantity + summary */}
        {selected && (
          <div className="mx-5 mb-4 flex items-center justify-between p-4 rounded-xl bg-muted/40 border border-border/40">
            <div>
              <p className="text-xs text-muted-foreground">Sous-total</p>
              <p className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "var(--sama-terra)" }}>
                {formatPrice(prix * qty)}
              </p>
            </div>
            <div className="flex items-center gap-2 border border-border/60 rounded-xl p-1 bg-background">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-bold">{qty}</span>
              <button
                onClick={() => setQty(Math.min(variant?.stockActuel ?? 99, qty + 1))}
                className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 pb-5">
          <button
            onClick={() => { if (selected) { onAdd(selected, qty); onClose(); } }}
            disabled={!selected}
            className="w-full h-11 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 btn-lift disabled:opacity-40 transition-all"
            style={{ background: "var(--sama-terra)" }}
          >
            <ShoppingCart className="w-4 h-4" />
            Ajouter au panier
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── POS Main ────────────────────────────────────────────────────────────────
export default function POS() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState<{ reference: string; total: number } | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [variantPickerProduct, setVariantPickerProduct] = useState<import("@/types").Product | null>(null);

  const cart = useCartStore();
  const { isOnline } = useUIStore();
  const createSaleMutation = useCreateSale();
  const { addNotification } = useUIStore();

  const handleSearch = useCallback(
    debounce((val: string) => setDebouncedSearch(val), 250),
    []
  );

  const { data: productsData } = useProducts({
    search: debouncedSearch || undefined,
    statut: "Actif",
    pageSize: 20,
  });
  const products = productsData?.data ?? [];

  const { data: clientsData } = useClients({
    search: clientSearch || undefined,
    pageSize: 10,
  });
  const clients = clientsData?.data ?? [];

  const addToCart = (product: Product) => {
    const availableVariants = product.variants.filter((v) => !v.isRupture);
    if (availableVariants.length === 0) return;
    if (product.variants.length > 1) { setVariantPickerProduct(product); return; }
    addVariantToCart(product, product.variants[0].id, 1);
  };

  const addVariantToCart = (product: Product, variantId: string, qty: number) => {
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant) return;
    const prix = variant.prix > 0 ? variant.prix : product.prixVente;
    cart.addItem({
      variantId: variant.id,
      productId: product.id,
      productNom: product.nom,
      variantInfo: [variant.taille, variant.couleur].filter(Boolean).join(" / ") || "Standard",
      prixUnitaire: prix,
      quantite: qty,
      remise: 0,
      imageUrl: product.photos[0],
    });
  };

  const handleScan = (code: string) => { setSearch(code); setDebouncedSearch(code); };

  const submitSale = async () => {
    const payload: SaleCreateRequest = {
      clientId: cart.clientId ?? undefined,
      remiseGlobale: cart.remiseGlobale,
      modePaiement: cart.modePaiement,
      montantRecu: cart.montantRecu,
      items: cart.items.map((item) => ({
        variantId: item.variantId,
        quantite: item.quantite,
        prixUnitaire: item.prixUnitaire,
        remisePct: item.remise,
      })),
    };

    if (!isOnline) {
      const id = await enqueueOfflineSale(payload);
      setShowPayment(false);
      setShowReceipt({ reference: `OFFLINE-${id.slice(-6).toUpperCase()}`, total: cart.total() });
      cart.clearCart();
      addNotification({ type: "warning", message: "Vente sauvegardée hors ligne. Elle sera synchronisée à la reconnexion." });
      return;
    }

    createSaleMutation.mutate(payload, {
      onSuccess: (sale) => {
        setShowPayment(false);
        setShowReceipt({ reference: sale.id.slice(0, 8).toUpperCase(), total: sale.totalTTC });
        cart.clearCart();
      },
    });
  };

  const renduMonnaie = cart.montantRecu - cart.total();

  return (
    <div className="h-[calc(100vh-3.5rem)] flex overflow-hidden">

      {/* ── Left: Product search ───────────────────────────────── */}
      <div className="flex-1 flex flex-col border-r border-border/50 overflow-hidden">
        <div className="p-4 border-b border-border/50 space-y-3 bg-background">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); handleSearch(e.target.value); }}
                placeholder="Rechercher un produit ou scanner…"
                className="search-input pl-10"
              />
            </div>
            <button
              onClick={() => setShowScanner(true)}
              className="w-11 h-11 rounded-xl border border-border/60 bg-background flex items-center justify-center transition-colors hover:bg-muted"
              style={{ color: "var(--sama-terra)" }}
              title="Scanner un code"
            >
              <QrCode className="w-5 h-5" />
            </button>
          </div>
          {!isOnline && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-warning/10 rounded-xl text-xs text-warning font-medium">
              <WifiOff className="w-3.5 h-3.5" />
              Mode hors ligne — les ventes seront synchronisées à la reconnexion
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3">
                <Package className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Aucun produit trouvé</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Essayez un autre terme de recherche</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {products.map((product) => {
                const stockTotal = product.variants.reduce((s, v) => s + v.stockActuel, 0);
                const firstVariant = product.variants[0];
                const displayPrice = (firstVariant?.prix && firstVariant.prix > 0) ? firstVariant.prix : product.prixVente;
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={stockTotal === 0}
                    className={cn(
                      "group text-left rounded-2xl border p-3 transition-all",
                      stockTotal === 0
                        ? "opacity-50 cursor-not-allowed border-border/40 bg-muted/20"
                        : "border-border/50 bg-card cursor-pointer hover:shadow-md hover:-translate-y-0.5"
                    )}
                    style={stockTotal > 0 ? { ["--tw-shadow-color" as string]: "rgba(196,98,45,0.12)" } : undefined}
                    onMouseEnter={(e) => stockTotal > 0 && ((e.currentTarget as HTMLElement).style.borderColor = "var(--sama-terra)")}
                    onMouseLeave={(e) => stockTotal > 0 && ((e.currentTarget as HTMLElement).style.borderColor = "")}
                  >
                    <div className="w-full aspect-square rounded-xl overflow-hidden bg-muted mb-3">
                      {product.photos[0] ? (
                        <img src={product.photos[0]} alt={product.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-foreground truncate">{product.nom}</p>
                    {product.variants.length > 1 && (
                      <p className="text-[10px] text-muted-foreground">{product.variants.length} variantes</p>
                    )}
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs font-bold" style={{ color: "var(--sama-terra)" }}>
                        {formatPrice(displayPrice)}
                      </span>
                      <span className={cn("text-[10px] font-medium", stockTotal === 0 ? "text-danger" : "text-muted-foreground")}>
                        {stockTotal === 0 ? "Rupture" : `×${stockTotal}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Cart ────────────────────────────────────────── */}
      <div className="w-80 xl:w-96 flex flex-col bg-background border-l border-border/50">
        {/* Cart header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-sm flex items-center gap-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              <ShoppingCart className="w-4 h-4" style={{ color: "var(--sama-terra)" }} />
              Panier
              {cart.totalItems() > 0 && (
                <span
                  className="text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  style={{ background: "var(--sama-terra)" }}
                >
                  {cart.totalItems()}
                </span>
              )}
            </h2>
            {cart.items.length > 0 && (
              <button
                onClick={() => cart.clearCart()}
                className="text-xs text-muted-foreground hover:text-danger transition-colors font-medium"
              >
                Vider
              </button>
            )}
          </div>

          {/* Client selector */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={cart.clientNom ?? clientSearch}
              onChange={(e) => { setClientSearch(e.target.value); if (!e.target.value) cart.setClient(null, null); }}
              placeholder="Client (optionnel)"
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-input bg-background text-xs outline-none transition-colors"
              style={{ ["--tw-ring-color" as string]: "var(--sama-terra)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--sama-terra)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "")}
            />
            {clientSearch && clients.length > 0 && !cart.clientId && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border/50 rounded-xl shadow-xl z-10 overflow-hidden">
                {clients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { cart.setClient(c.id, c.nom); setClientSearch(""); }}
                    className="w-full px-3 py-2.5 text-left text-xs hover:bg-muted transition-colors"
                  >
                    <span className="font-semibold">{c.nom}</span>
                    {c.telephone && <span className="text-muted-foreground ml-2">{c.telephone}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <ShoppingCart className="w-10 h-10 text-muted-foreground/20 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">Panier vide</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Ajoutez des produits</p>
            </div>
          ) : (
            cart.items.map((item) => (
              <div
                key={item.variantId}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/30 border border-border/40"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{item.productNom}</p>
                  <p className="text-[11px] text-muted-foreground">{item.variantInfo}</p>
                  <p className="text-xs font-bold mt-0.5" style={{ color: "var(--sama-terra)" }}>
                    {formatPrice(item.prixUnitaire * item.quantite * (1 - item.remise / 100))}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => cart.updateQuantity(item.variantId, item.quantite - 1)}
                    className="w-6 h-6 rounded-lg bg-background border border-border/50 flex items-center justify-center hover:border-danger/50 hover:text-danger transition-colors"
                  >
                    <Minus className="w-2.5 h-2.5" />
                  </button>
                  <span className="text-xs font-bold w-6 text-center">{item.quantite}</span>
                  <button
                    onClick={() => cart.updateQuantity(item.variantId, item.quantite + 1)}
                    className="w-6 h-6 rounded-lg bg-background border border-border/50 flex items-center justify-center transition-colors"
                    style={{ ["--hover-border" as string]: "var(--sama-terra)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--sama-terra)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={() => cart.removeItem(item.variantId)}
                    className="w-6 h-6 rounded-lg ml-0.5 hover:bg-danger/10 flex items-center justify-center text-muted-foreground hover:text-danger transition-colors"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals + checkout */}
        <div className="p-3 border-t border-border/50 space-y-3 bg-background">
          {/* Remise globale */}
          <div className="flex items-center gap-2 px-1">
            <Percent className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground flex-1">Remise globale</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={cart.remiseGlobale}
                onChange={(e) => cart.setRemiseGlobale(Number(e.target.value))}
                min={0} max={100}
                className="w-14 h-8 text-center text-xs rounded-lg border border-input bg-background outline-none transition-colors"
                onFocus={(e) => (e.currentTarget.style.borderColor = "var(--sama-terra)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "")}
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs bg-muted/30 rounded-xl p-3">
            <div className="flex justify-between text-muted-foreground">
              <span>Sous-total</span>
              <span>{formatPrice(cart.subtotal())}</span>
            </div>
            {cart.remiseGlobale > 0 && (
              <div className="flex justify-between text-success font-medium">
                <span>Remise ({cart.remiseGlobale}%)</span>
                <span>−{formatPrice(cart.subtotal() - cart.total())}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm pt-1.5 border-t border-border/40">
              <span className="text-foreground">Total</span>
              <span style={{ color: "var(--sama-terra)" }}>{formatPrice(cart.total())}</span>
            </div>
          </div>

          <button
            onClick={() => setShowPayment(true)}
            disabled={cart.items.length === 0}
            className="w-full h-11 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 btn-lift disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ background: "var(--sama-terra)" }}
          >
            <CreditCard className="w-4 h-4" />
            Encaisser — {formatPrice(cart.total())}
          </button>
        </div>
      </div>

      {/* ── Scanner modal ──────────────────────────────────────── */}
      {showScanner && (
        <QRScannerModal onClose={() => setShowScanner(false)} onResult={handleScan} />
      )}

      {/* ── Variant picker modal ───────────────────────────────── */}
      {variantPickerProduct && (
        <VariantPickerModal
          product={variantPickerProduct}
          onClose={() => setVariantPickerProduct(null)}
          onAdd={(variantId, qty) => addVariantToCart(variantPickerProduct, variantId, qty)}
        />
      )}

      {/* ── Payment modal ──────────────────────────────────────── */}
      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPayment(false)} />
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border/50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-1 h-6 rounded-full" style={{ background: "var(--sama-terra)" }} />
                <h3 className="text-lg font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Encaissement
                </h3>
              </div>
              <button onClick={() => setShowPayment(false)} className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Total */}
              <div
                className="p-5 rounded-2xl text-center border"
                style={{ background: "var(--sama-terra-light)", borderColor: "rgba(196,98,45,0.2)" }}
              >
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Total à payer
                </p>
                <p
                  className="text-4xl font-bold"
                  style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "var(--sama-terra)" }}
                >
                  {formatPrice(cart.total())}
                </p>
              </div>

              {/* Payment mode */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Mode de paiement
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_MODES.map(({ value, label, icon }) => {
                    const isSelected = cart.modePaiement === value;
                    return (
                      <button
                        key={value}
                        onClick={() => cart.setModePaiement(value)}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all"
                        style={
                          isSelected
                            ? { borderColor: "var(--sama-terra)", background: "var(--sama-terra-light)", color: "var(--sama-terra)" }
                            : { color: "var(--muted-foreground)" }
                        }
                      >
                        {icon}
                        <span className="text-xs">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Montant reçu (espèces) */}
              {cart.modePaiement === "Especes" && (
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Montant reçu
                  </label>
                  <input
                    type="number"
                    value={cart.montantRecu || ""}
                    onChange={(e) => cart.setMontantRecu(Number(e.target.value))}
                    className="input-field text-lg font-bold text-center"
                    placeholder={String(cart.total())}
                  />
                  {renduMonnaie > 0 && (
                    <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-success/10 border border-success/20">
                      <span className="text-sm font-semibold text-success">Monnaie à rendre</span>
                      <span className="text-lg font-bold text-success">{formatPrice(renduMonnaie)}</span>
                    </div>
                  )}
                </div>
              )}

              {createSaleMutation.error && (
                <div className="p-3 rounded-xl bg-danger/8 border border-danger/20 text-sm text-danger">
                  {(createSaleMutation.error as Error).message}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 justify-end px-6 py-4 border-t border-border/50 bg-muted/20">
              <button type="button" onClick={() => setShowPayment(false)} className="btn-outline">
                Annuler
              </button>
              <button
                onClick={submitSale}
                disabled={createSaleMutation.isPending || (cart.modePaiement === "Especes" && cart.montantRecu < cart.total())}
                className="h-11 px-6 rounded-xl text-white text-sm font-bold flex items-center gap-2 hover:opacity-90 btn-lift disabled:opacity-40 transition-all bg-success"
              >
                {createSaleMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {isOnline ? "Valider la vente" : "Sauvegarder hors ligne"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Receipt modal ──────────────────────────────────────── */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-sm border border-border/50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden text-center">
            {/* Green top bar */}
            <div className="h-1.5 bg-success w-full" />
            <div className="p-8">
              <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-5">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Vente effectuée !
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Référence : <span className="font-bold text-foreground">#{showReceipt.reference}</span>
              </p>
              <p
                className="text-3xl font-bold mb-6"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: "var(--sama-terra)" }}
              >
                {formatPrice(showReceipt.total)}
              </p>
              <button
                onClick={() => setShowReceipt(null)}
                className="w-full h-11 rounded-xl text-white text-sm font-bold hover:opacity-90 btn-lift transition-all"
                style={{ background: "var(--sama-terra)" }}
              >
                Nouvelle vente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
