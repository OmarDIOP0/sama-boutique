import { Link } from "react-router-dom";
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, Package } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { StoreIcon } from "@/components/shared/StoreIcon";
import { formatPrice } from "@/lib/utils";

export default function Cart() {
    const cart = useCartStore();

    /* Empty state */
    if (cart.items.length === 0) {
        return (
            <div className="min-h-screen wurus-bg">
                <div className="max-w-2xl mx-auto px-4 py-24 text-center">
                    <div className="flex justify-center mb-5">
                        <StoreIcon icon={ShoppingCart} color="amber" size="lg" />
                    </div>
                    <h1
                        style={{
                            fontSize: 22,
                            fontWeight: 700,
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontStyle: "italic",
                            marginBottom: 10,
                            color: "#513102",
                        }}
                    >
                        Votre panier est vide
                    </h1>
                    <p className="mb-8" style={{ fontSize: 14, color: "rgba(81,49,2,0.55)" }}>
                        Découvrez notre catalogue et ajoutez des articles à votre panier.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all wurus-btn-primary"
                        style={{ fontSize: 14, padding: "12px 24px" }}
                    >
                        Découvrir le catalogue
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen wurus-bg">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

                {/* ── Section title ─────────────────────────────────────────────── */}
                <div className="flex items-center gap-2.5 mb-8">
                    <div className="w-1 h-5 rounded-full" style={{ background: "#C7932D" }} />
                    <h1
                        style={{
                            fontSize: 18,
                            fontWeight: 700,
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontStyle: "italic",
                            color: "#513102",
                        }}
                    >
                        Votre panier
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Items card ─────────────────────────────────────────────── */}
                    <div className="lg:col-span-2 wurus-card overflow-hidden">

                        {/* Card header */}
                        <div
                            className="px-5 py-3.5 flex items-center gap-2.5"
                            style={{ borderBottom: "1px solid rgba(81,49,2,0.06)" }}
                        >
                            <div
                                className="w-6 h-6 rounded-md flex items-center justify-center"
                                style={{ background: "rgba(199,147,45,0.10)" }}
                            >
                                <ShoppingCart className="w-3 h-3" style={{ color: "#C7932D" }} />
                            </div>
                            <span
                                style={{
                                    fontSize: 10.5,
                                    fontWeight: 700,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase" as const,
                                    color: "rgba(81,49,2,0.55)",
                                }}
                            >
                                Articles ({cart.items.length})
                            </span>
                        </div>

                        {/* Items */}
                        <div className="divide-y" style={{ borderColor: "rgba(81,49,2,0.05)" }}>
                            {cart.items.map((item) => (
                                <div key={item.variantId} className="flex items-center gap-4 px-5 py-4">

                                    {/* Product image */}
                                    <div
                                        className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0"
                                        style={{ background: "rgba(199,147,45,0.08)" }}
                                    >
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.productNom}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-5 h-5" style={{ color: "rgba(199,147,45,0.35)" }} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className="font-semibold truncate"
                                            style={{ fontSize: 13.5, color: "#513102" }}
                                        >
                                            {item.productNom}
                                        </p>
                                        <p style={{ fontSize: 12, color: "rgba(81,49,2,0.55)" }}>{item.variantInfo}</p>
                                        <p className="font-bold mt-0.5" style={{ fontSize: 14, color: "#C7932D" }}>
                                            {formatPrice(item.prixUnitaire * item.quantite)}
                                        </p>
                                    </div>

                                    {/* Qty + remove */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                border: "1.5px solid rgba(199,147,45,0.20)",
                                                borderRadius: 10,
                                                overflow: "hidden",
                                                background: "rgba(255,248,238,0.60)",
                                            }}
                                        >
                                            <button
                                                onClick={() =>
                                                    cart.updateQuantity(item.variantId, item.quantite - 1)
                                                }
                                                className="w-7 h-7 flex items-center justify-center transition-colors"
                                                style={{ color: "rgba(81,49,2,0.55)" }}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span
                                                style={{
                                                    width: 28,
                                                    textAlign: "center" as const,
                                                    fontSize: 13,
                                                    fontWeight: 700,
                                                    color: "#513102",
                                                }}
                                            >
                                                {item.quantite}
                                            </span>
                                            <button
                                                onClick={() =>
                                                    cart.updateQuantity(item.variantId, item.quantite + 1)
                                                }
                                                className="w-7 h-7 flex items-center justify-center transition-colors"
                                                style={{ color: "rgba(81,49,2,0.55)" }}
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => cart.removeItem(item.variantId)}
                                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-red-50"
                                            style={{ background: "rgba(239,68,68,0.07)" }}
                                        >
                                            <Trash2 className="w-3.5 h-3.5" style={{ color: "#EF4444" }} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Summary card ───────────────────────────────────────────── */}
                    <div className="lg:col-span-1">
                        <div className="wurus-card p-5 sticky top-20">

                            {/* Mini title */}
                            <div className="flex items-center gap-2 mb-5">
                                <div className="w-0.5 h-4 rounded-full" style={{ background: "#C7932D" }} />
                                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#513102" }}>
                                    Récapitulatif
                                </h3>
                            </div>

                            <div className="space-y-2.5 mb-5">
                                <div className="flex justify-between" style={{ fontSize: 13 }}>
                                    <span style={{ color: "rgba(81,49,2,0.55)" }}>Sous-total</span>
                                    <span style={{ fontWeight: 600, color: "#513102" }}>
                                        {formatPrice(cart.subtotal())}
                                    </span>
                                </div>
                                <div className="flex justify-between" style={{ fontSize: 12 }}>
                                    <span style={{ color: "rgba(81,49,2,0.55)" }}>Livraison</span>
                                    <span style={{ fontWeight: 600, color: "#2D7A4F" }}>
                                        Calculée à l'étape suivante
                                    </span>
                                </div>
                                <div
                                    className="flex justify-between pt-3"
                                    style={{ borderTop: "1px solid rgba(81,49,2,0.06)" }}
                                >
                                    <span style={{ fontSize: 14, fontWeight: 700, color: "#513102" }}>Total</span>
                                    <span style={{ fontSize: 16, fontWeight: 800, color: "#C7932D" }}>
                                        {formatPrice(cart.total())}
                                    </span>
                                </div>
                            </div>

                            <Link
                                to="/checkout"
                                className="w-full flex items-center justify-center gap-2 h-12 font-semibold wurus-btn-gold"
                                style={{ fontSize: 13.5 }}
                            >
                                Commander
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                to="/"
                                className="w-full flex items-center justify-center mt-3 hover:opacity-75 transition-opacity"
                                style={{ fontSize: 12.5, color: "rgba(81,49,2,0.55)" }}
                            >
                                Continuer mes achats
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
