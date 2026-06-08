import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Check, Clock, Package, Truck, MapPin, ShoppingBag, Download } from "lucide-react";
import { useOrder } from "@/hooks/useOrders";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { OrderReceipt } from "@/components/shared/OrderReceipt";
import { formatPrice } from "@/lib/utils";
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
    const [showReceipt, setShowReceipt] = useState(false);

    if (isLoading) return <LoadingSkeleton variant="page" />;
    if (!order)
        return (
            <div className="flex flex-col items-center justify-center py-28 text-center">
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "rgba(184,77,34,0.08)" }}
                >
                    <Package className="w-6 h-6" style={{ color: "#C7932D" }} />
                </div>
                <p className="font-bold text-foreground mb-1" style={{ fontSize: 15 }}>
                    Commande introuvable
                </p>
                <Link
                    to="/compte"
                    className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium hover:opacity-75 transition-opacity"
                    style={{ color: "#C7932D" }}
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Retour
                </Link>
            </div>
        );

    const currentIdx = STATUS_ORDER.indexOf(order.statut);
    const isCancelled = order.statut === "Annulee" || order.statut === "Retournee";

    return (
        <div className="min-h-screen wurus-bg">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">

                {/* ── Back link + Reçu ─────────────────────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <Link
                        to="/compte"
                        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium hover:opacity-75 transition-opacity"
                        style={{ color: "rgba(81,49,2,0.55)" }}
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Mes commandes
                    </Link>
                    <button
                        onClick={() => setShowReceipt(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-full font-semibold transition-all hover:opacity-80"
                        style={{ fontSize: 12, background: "rgba(199,147,45,0.10)", border: "1.5px solid rgba(199,147,45,0.30)", color: "#C7932D", cursor: "pointer" }}
                    >
                        <Download className="w-3.5 h-3.5" />
                        Reçu PDF
                    </button>
                </div>

                {/* ── Header card ──────────────────────────────────────────────────── */}
                <div className="wurus-card overflow-hidden">
                    {/* Top row: order number + total */}
                    <div className="px-5 py-4 flex items-center justify-between">
                        <div>
                            <span
                                style={{
                                    fontSize: 10,
                                    fontWeight: 700,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase" as const,
                                    color: "rgba(81,49,2,0.55)",
                                }}
                            >
                                Commande
                            </span>
                            <p className="font-mono font-bold mt-0.5" style={{ fontSize: 15, color: "#513102" }}>
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
                                    color: "rgba(81,49,2,0.55)",
                                }}
                            >
                                Total
                            </span>
                            <p className="font-bold mt-0.5" style={{ fontSize: 17, color: "#C7932D" }}>
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
                                            background: "#C7932D",
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
                                                    background: done || active ? "#C7932D" : "rgba(81,49,2,0.08)",
                                                    color: done || active ? "white" : "rgba(81,49,2,0.40)",
                                                    boxShadow: active ? "0 0 0 4px rgba(199,147,45,0.20)" : "none",
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
                                                        ? "#C7932D"
                                                        : done
                                                            ? "#513102"
                                                            : "rgba(81,49,2,0.45)",
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
                <div className="wurus-card overflow-hidden">
                    {/* Header */}
                    <div
                        className="px-5 py-3.5 flex items-center gap-2.5"
                        style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
                    >
                        <div
                            className="w-6 h-6 rounded-md flex items-center justify-center"
                            style={{ background: "rgba(184,77,34,0.08)" }}
                        >
                            <ShoppingBag className="w-3 h-3" style={{ color: "#C7932D" }} />
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
                                                    color: "rgba(81,49,2,0.55)",
                                                }}
                                            >
                                                {item.variante}
                                            </span>
                                        )}
                                        <span style={{ fontSize: 11, color: "rgba(81,49,2,0.55)" }}>
                                            ×{item.quantite}
                                        </span>
                                    </div>
                                </div>
                                <span className="font-bold flex-shrink-0 ml-4" style={{ fontSize: 13, color: "#513102" }}>
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
                            <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "rgba(81,49,2,0.55)" }} />
                            <div>
                                <span
                                    style={{
                                        fontSize: 10,
                                        fontWeight: 700,
                                        letterSpacing: "0.1em",
                                        textTransform: "uppercase" as const,
                                        color: "rgba(81,49,2,0.55)",
                                    }}
                                >
                                    Livraison
                                </span>
                                <p className="mt-0.5" style={{ fontSize: 13, color: "#513102" }}>
                                    {order.adresseLivraison}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reçu modal */}
            {showReceipt && order && (
                <OrderReceipt order={order} onClose={() => setShowReceipt(false)} modal={true} />
            )}
        </div>
    );
}