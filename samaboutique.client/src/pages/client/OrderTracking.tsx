import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Check, Clock, Package, Truck, MapPin, ShoppingBag, ChevronRight } from "lucide-react";
import { useOrder } from "@/hooks/useOrders";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { formatPrice, formatDateTime, cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STEPS: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
    { status: "EnAttente", label: "Reçue", icon: Clock },
    { status: "Confirmee", label: "Confirmée", icon: Check },
    { status: "EnPreparation", label: "Préparation", icon: Package },
    { status: "Expediee", label: "Expédiée", icon: Truck },
    { status: "Livree", label: "Livrée", icon: MapPin },
];

const STATUS_ORDER: OrderStatus[] = ["EnAttente", "Confirmee", "EnPreparation", "Expediee", "Livree"];

export default function OrderTracking() {
    const { id } = useParams<{ id: string }>();
    const { data: order, isLoading } = useOrder(id);

    if (isLoading) return <LoadingSkeleton variant="page" />;
    if (!order)
        return (
            <div className="flex flex-col items-center justify-center py-28 text-center">
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "rgba(184,77,34,0.08)" }}
                >
                    <Package className="w-6 h-6" style={{ color: "var(--sama-terra, #B84D22)" }} />
                </div>
                <p className="font-bold text-foreground mb-1" style={{ fontSize: 15 }}>
                    Commande introuvable
                </p>
                <Link
                    to="/compte"
                    className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium hover:opacity-75 transition-opacity"
                    style={{ color: "var(--sama-terra, #B84D22)" }}
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Retour
                </Link>
            </div>
        );

    const currentIdx = STATUS_ORDER.indexOf(order.statut);
    const isCancelled = order.statut === "Annulee" || order.statut === "Retournee";

    return (
        <div
            className="min-h-screen"
            style={{
                backgroundImage:
                    "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(184,77,34,0.025) 8px, rgba(184,77,34,0.025) 9px)",
            }}
        >
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">

                {/* ── Back link ────────────────────────────────────────────────────── */}
                <Link
                    to="/compte"
                    className="inline-flex items-center gap-1.5 text-[12.5px] font-medium hover:opacity-75 transition-opacity"
                    style={{ color: "var(--sama-warm-muted, #9A8A7A)" }}
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Mes commandes
                </Link>

                {/* ── Header card ──────────────────────────────────────────────────── */}
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        background: "rgba(255,255,255,0.75)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(0,0,0,0.06)",
                    }}
                >
                    {/* Top row: order number + total */}
                    <div className="px-5 py-4 flex items-center justify-between">
                        <div>
                            <span
                                style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase" as const,
                                    color: "var(--sama-warm-muted, #9A8A7A)",
                                }}
                            >
                                Commande
                            </span>
                            <p className="font-mono font-bold mt-0.5" style={{ fontSize: 15, color: "var(--sama-dark, #0F0C0A)" }}>
                                {order.numeroFacture ?? order.id.slice(0, 8).toUpperCase()}
                            </p>
                        </div>
                        <div className="text-right">
                            <span
                                style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase" as const,
                                    color: "var(--sama-warm-muted, #9A8A7A)",
                                }}
                            >
                                Total
                            </span>
                            <p className="font-bold mt-0.5" style={{ fontSize: 17, color: "var(--sama-terra, #B84D22)" }}>
                                {formatPrice(order.totalTTC)}
                            </p>
                        </div>
                    </div>

                    {/* ── Timeline ─────────────────────────────────────────────────── */}
                    {!isCancelled ? (
                        <div
                            className="px-5 py-5"
                            style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
                        >
                            <div className="relative flex items-start justify-between">
                                {/* Track line */}
                                <div
                                    className="absolute h-[2px] z-0"
                                    style={{
                                        top: 14,
                                        left: 16,
                                        right: 16,
                                        background: "rgba(0,0,0,0.06)",
                                        borderRadius: 2,
                                    }}
                                >
                                    <div
                                        className="h-full rounded-full transition-all duration-700 ease-out"
                                        style={{
                                            width: currentIdx >= 0 ? `${(currentIdx / (STEPS.length - 1)) * 100}%` : "0%",
                                            background: "var(--sama-terra, #B84D22)",
                                        }}
                                    />
                                </div>

                                {STEPS.map((step, i) => {
                                    const done = i < currentIdx;
                                    const active = i === currentIdx;
                                    const Icon = step.icon;
                                    return (
                                        <div key={step.status} className="flex flex-col items-center gap-1.5 relative z-10" style={{ width: 56 }}>
                                            <div
                                                className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                                                style={{
                                                    background: done || active ? "var(--sama-terra, #B84D22)" : "rgba(0,0,0,0.06)",
                                                    color: done || active ? "white" : "var(--sama-warm-muted, #9A8A7A)",
                                                    boxShadow: active ? "0 0 0 4px rgba(184,77,34,0.12)" : "none",
                                                }}
                                            >
                                                <Icon className="w-3 h-3" />
                                            </div>
                                            <span
                                                className="text-center leading-tight"
                                                style={{
                                                    fontSize: 10,
                                                    fontWeight: active ? 700 : 500,
                                                    color: active
                                                        ? "var(--sama-terra, #B84D22)"
                                                        : done
                                                            ? "var(--sama-dark, #0F0C0A)"
                                                            : "var(--sama-warm-muted, #9A8A7A)",
                                                }}
                                            >
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div
                            className="mx-5 mb-5 px-4 py-3 rounded-xl"
                            style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)" }}
                        >
                            <p className="text-[13px] font-semibold" style={{ color: "#dc2626" }}>
                                Commande {order.statut === "Annulee" ? "annulée" : "retournée"}
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Items card ───────────────────────────────────────────────────── */}
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                        background: "rgba(255,255,255,0.75)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(0,0,0,0.06)",
                    }}
                >
                    {/* Header */}
                    <div
                        className="px-5 py-3.5 flex items-center gap-2.5"
                        style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
                    >
                        <div
                            className="w-6 h-6 rounded-md flex items-center justify-center"
                            style={{ background: "rgba(184,77,34,0.08)" }}
                        >
                            <ShoppingBag className="w-3 h-3" style={{ color: "var(--sama-terra, #B84D22)" }} />
                        </div>
                        <span
                            style={{
                                fontSize: 10.5,
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase" as const,
                                color: "var(--sama-warm-muted, #9A8A7A)",
                            }}
                        >
                            Articles commandés
                        </span>
                    </div>

                    {/* Item rows */}
                    <div className="divide-y" style={{ borderColor: "rgba(0,0,0,0.04)" }}>
                        {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between px-5 py-3.5">
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-foreground line-clamp-1" style={{ fontSize: 13 }}>
                                        {item.productNom}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {item.variante && (
                                            <span
                                                className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide"
                                                style={{
                                                    background: "rgba(0,0,0,0.04)",
                                                    color: "var(--sama-warm-muted, #9A8A7A)",
                                                }}
                                            >
                                                {item.variante}
                                            </span>
                                        )}
                                        <span style={{ fontSize: 11, color: "var(--sama-warm-muted, #9A8A7A)" }}>
                                            ×{item.quantite}
                                        </span>
                                    </div>
                                </div>
                                <span className="font-bold flex-shrink-0 ml-4" style={{ fontSize: 13, color: "var(--sama-dark, #0F0C0A)" }}>
                                    {formatPrice(item.sousTotal)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Delivery address */}
                    {order.adresseLivraison && (
                        <div
                            className="px-5 py-3.5 flex items-start gap-3"
                            style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}
                        >
                            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "var(--sama-warm-muted, #9A8A7A)" }} />
                            <div>
                                <span
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        letterSpacing: "0.1em",
                                        textTransform: "uppercase" as const,
                                        color: "var(--sama-warm-muted, #9A8A7A)",
                                    }}
                                >
                                    Livraison
                                </span>
                                <p className="mt-0.5" style={{ fontSize: 13, color: "var(--sama-dark, #0F0C0A)" }}>
                                    {order.adresseLivraison}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}