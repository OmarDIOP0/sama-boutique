import { useState } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { Check, ShoppingBag, Home, Download, Package, MapPin, CreditCard, Calendar } from "lucide-react";
import { OrderReceipt } from "@/components/shared/OrderReceipt";
import { formatPrice, formatDateTime } from "@/lib/utils";
import type { Order } from "@/types";

export default function OrderConfirm() {
    const [params] = useSearchParams();
    const { state } = useLocation() as { state?: { order?: Order } };
    const reference = params.get("ref");
    const order = state?.order;
    const [showReceipt, setShowReceipt] = useState(false);

    return (
        <div className="min-h-screen wurus-bg">
            <div className="max-w-xl mx-auto px-4 py-12">

                {/* ── Succès header ── */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
                        style={{ background: "rgba(34,197,94,0.10)", border: "2px solid rgba(34,197,94,0.20)" }}>
                        <Check className="w-10 h-10" style={{ color: "#22C55E" }} />
                    </div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Playfair Display',Georgia,serif", fontStyle: "italic", color: "#513102", marginBottom: 8 }}>
                        Commande confirmée !
                    </h1>
                    <p style={{ fontSize: 14, color: "rgba(81,49,2,0.55)" }}>
                        Merci pour votre commande. Nous la traitons dès maintenant.
                    </p>
                    {reference && (
                        <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl"
                            style={{ background: "rgba(199,147,45,0.09)", border: "1px solid rgba(199,147,45,0.22)" }}>
                            <span style={{ fontSize: 12, color: "rgba(81,49,2,0.55)", fontWeight: 500 }}>Référence :</span>
                            <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "monospace", color: "#C7932D" }}>{reference}</span>
                        </div>
                    )}
                </div>

                {/* ── Détail commande (si order disponible) ── */}
                {order ? (
                    <div className="wurus-card overflow-hidden mb-5">

                        {/* Header card */}
                        <div className="flex items-center justify-between px-5 py-3.5"
                            style={{ borderBottom: "1px solid rgba(81,49,2,0.06)" }}>
                            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "rgba(81,49,2,0.45)" }}>
                                Détail de la commande
                            </p>
                            <button onClick={() => setShowReceipt(true)}
                                className="flex items-center gap-1.5 font-semibold transition-opacity hover:opacity-70"
                                style={{ fontSize: 12, color: "#C7932D", background: "none", border: "none", cursor: "pointer" }}>
                                <Download className="w-3.5 h-3.5" />
                                Télécharger le reçu
                            </button>
                        </div>

                        {/* Articles */}
                        <div className="px-5 py-4 space-y-3">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                                        style={{ background: "rgba(199,147,45,0.09)" }}>
                                        <Package className="w-4 h-4" style={{ color: "rgba(199,147,45,0.55)" }} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="truncate" style={{ fontSize: 13, fontWeight: 600, color: "#513102" }}>{item.productNom}</p>
                                        {item.variante && <p style={{ fontSize: 11, color: "rgba(81,49,2,0.55)" }}>{item.variante}</p>}
                                        <p style={{ fontSize: 11, color: "rgba(81,49,2,0.50)" }}>×{item.quantite}</p>
                                    </div>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: "#513102", flexShrink: 0 }}>
                                        {formatPrice(item.sousTotal)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center px-5 py-3"
                            style={{ borderTop: "1px solid rgba(81,49,2,0.06)" }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#513102" }}>Total payé</span>
                            <span style={{ fontSize: 18, fontWeight: 900, color: "#C7932D" }}>{formatPrice(order.totalTTC)}</span>
                        </div>

                        {/* Infos livraison */}
                        <div className="px-5 py-4 space-y-2.5"
                            style={{ borderTop: "1px solid rgba(81,49,2,0.06)", background: "rgba(199,147,45,0.02)" }}>
                            {[
                                { icon: MapPin,       label: "Livraison",  value: order.adresseLivraison },
                                { icon: CreditCard,   label: "Paiement",   value: order.modePaiement },
                                { icon: Calendar,     label: "Date",        value: formatDateTime(order.createdAt) },
                            ].filter(r => r.value).map(({ icon: Icon, label, value }) => (
                                <div key={label} className="flex items-start gap-2.5">
                                    <Icon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#C7932D" }} />
                                    <div className="flex gap-1.5 flex-wrap">
                                        <span style={{ fontSize: 12, fontWeight: 700, color: "#513102" }}>{label} :</span>
                                        <span style={{ fontSize: 12, color: "rgba(81,49,2,0.65)" }}>{value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Progression livraison */}
                        <div className="px-5 py-4 space-y-2" style={{ borderTop: "1px solid rgba(81,49,2,0.06)" }}>
                            <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.10em", color: "rgba(81,49,2,0.40)", marginBottom: 10 }}>
                                Suivi de votre commande
                            </p>
                            {[
                                { label: "Commande enregistrée",   done: true },
                                { label: "Paiement Wave confirmé",  done: true },
                                { label: "En préparation",          done: order.statut === "EnPreparation" || ["Expediee","Livree"].includes(order.statut) },
                                { label: "Expédiée",                done: ["Expediee","Livree"].includes(order.statut) },
                                { label: "Livrée",                  done: order.statut === "Livree" },
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                                        style={{ background: step.done ? "#22C55E" : "rgba(81,49,2,0.08)" }}>
                                        {step.done
                                            ? <Check className="w-3 h-3 text-white" />
                                            : <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(81,49,2,0.18)" }} />
                                        }
                                    </div>
                                    <span style={{ fontSize: 12, color: step.done ? "#513102" : "rgba(81,49,2,0.38)", fontWeight: step.done ? 600 : 400 }}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* Si pas de données order (navigation directe) */
                    reference && (
                        <div className="wurus-card p-5 mb-5 text-center">
                            <p style={{ fontSize: 13, color: "rgba(81,49,2,0.55)" }}>
                                Commande <strong style={{ color: "#C7932D" }}>{reference}</strong> enregistrée avec succès.
                            </p>
                            <p style={{ fontSize: 12, color: "rgba(81,49,2,0.40)", marginTop: 6 }}>
                                Consultez votre espace "Mes commandes" pour le suivi.
                            </p>
                        </div>
                    )
                )}

                {/* ── Actions ── */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {order && (
                        <button onClick={() => setShowReceipt(true)}
                            className="flex items-center justify-center gap-2 font-semibold rounded-full"
                            style={{ height: 46, background: "rgba(199,147,45,0.10)", border: "1.5px solid rgba(199,147,45,0.30)", color: "#C7932D", fontSize: 13, cursor: "pointer" }}>
                            <Download className="w-4 h-4" />
                            Reçu PDF
                        </button>
                    )}
                    <Link to="/compte"
                        className="flex items-center justify-center gap-2 font-semibold rounded-full"
                        style={{ height: 46, background: "#513102", color: "#FFF8EE", fontSize: 13, flex: 1, textDecoration: "none" }}>
                        <ShoppingBag className="w-4 h-4" />
                        Suivre ma commande
                    </Link>
                    <Link to="/"
                        className="flex items-center justify-center gap-2 font-semibold rounded-full"
                        style={{ height: 46, border: "1.5px solid rgba(81,49,2,0.20)", color: "#513102", fontSize: 13, textDecoration: "none" }}>
                        <Home className="w-4 h-4" />
                        Accueil
                    </Link>
                </div>
            </div>

            {/* ── Reçu modal ── */}
            {showReceipt && order && (
                <OrderReceipt order={order} onClose={() => setShowReceipt(false)} modal={true} />
            )}
        </div>
    );
}
