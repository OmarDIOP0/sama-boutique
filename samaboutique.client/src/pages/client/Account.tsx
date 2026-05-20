import { Link } from "react-router-dom";
import { LogOut, ArrowRight, Package, ShoppingBag, User, ChevronRight } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout } from "@/hooks/useAuth";
import { formatPrice, formatDate, cn } from "@/lib/utils";

/* ── Status helpers ─────────────────────────────────────────────────────────── */
const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    Livree: { label: "Livrée", bg: "rgba(34,197,94,0.08)", text: "#16a34a", dot: "#22C55E" },
    EnAttente: { label: "En attente", bg: "rgba(234,179,8,0.08)", text: "#b45309", dot: "#EAB308" },
    Confirmee: { label: "Confirmée", bg: "rgba(59,130,246,0.08)", text: "#2563eb", dot: "#3B82F6" },
    Annulee: { label: "Annulée", bg: "rgba(239,68,68,0.08)", text: "#dc2626", dot: "#EF4444" },
    EnCours: { label: "En cours", bg: "rgba(168,85,247,0.08)", text: "#7c3aed", dot: "#A855F7" },
};

function StatusBadge({ statut }: { statut: string }) {
    const s = STATUS_MAP[statut] ?? { label: statut, bg: "rgba(0,0,0,0.04)", text: "var(--sama-warm-muted)", dot: "#9A8A7A" };
    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] font-semibold tracking-wide"
            style={{ background: s.bg, color: s.text }}
        >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
            {s.label}
        </span>
    );
}

/* ── Main ───────────────────────────────────────────────────────────────────── */
export default function Account() {
    const { user } = useAuthStore();
    const logoutMutation = useLogout();
    const { data: ordersData } = useOrders({ pageSize: 10 });

    const orders = ordersData?.data ?? [];
    const initial = user?.nom?.[0]?.toUpperCase() ?? "?";

    return (
        <div
            className="min-h-screen"
            style={{
                backgroundImage:
                    "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(184,77,34,0.025) 8px, rgba(184,77,34,0.025) 9px)",
            }}
        >
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">

                {/* ── Section title ────────────────────────────────────────────────── */}
                <div className="flex items-center gap-2.5">
                    <div className="w-1 h-5 rounded-full" style={{ background: "var(--sama-terra, #B84D22)" }} />
                    <h1
                        style={{
                            fontSize: 18,
                            fontWeight: 700,
                            fontFamily: "'Playfair Display', Georgia, serif",
                            fontStyle: "italic",
                        }}
                    >
                        Mon compte
                    </h1>
                </div>

                {/* ── Profile card ─────────────────────────────────────────────────── */}
                <div
                    className="rounded-2xl p-6 sm:p-7"
                    style={{
                        background: "rgba(255,255,255,0.75)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(0,0,0,0.06)",
                    }}
                >
                    <div className="flex flex-wrap items-center gap-5">
                        {/* Avatar */}
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(184,77,34,0.08)" }}
                        >
                            <span
                                className="text-xl font-bold"
                                style={{ color: "var(--sama-terra, #B84D22)", fontFamily: "'Playfair Display', Georgia, serif" }}
                            >
                                {initial}
                            </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h2 className="font-bold text-foreground" style={{ fontSize: 16 }}>
                                {user?.nom}
                            </h2>
                            <p style={{ fontSize: 13, color: "var(--sama-warm-muted, #9A8A7A)" }}>
                                {user?.email}
                            </p>
                            <span
                                className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest uppercase"
                                style={{
                                    background: "rgba(184,77,34,0.06)",
                                    color: "var(--sama-terra, #B84D22)",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                {user?.role}
                            </span>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={() => logoutMutation.mutate()}
                            className="flex items-center gap-2 h-9 px-4 rounded-full text-[12px] font-medium transition-all hover:opacity-75"
                            style={{
                                border: "1.5px solid rgba(0,0,0,0.1)",
                                color: "var(--sama-warm-muted, #9A8A7A)",
                                background: "transparent",
                            }}
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Déconnexion
                        </button>
                    </div>
                </div>

                {/* ── Orders section ───────────────────────────────────────────────── */}
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
                        className="px-6 py-4 flex items-center justify-between"
                        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{ background: "rgba(184,77,34,0.08)" }}
                            >
                                <ShoppingBag className="w-3.5 h-3.5" style={{ color: "var(--sama-terra, #B84D22)" }} />
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
                                Mes commandes
                            </span>
                        </div>
                        {orders.length > 0 && (
                            <span
                                className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                style={{ background: "rgba(0,0,0,0.05)", color: "var(--sama-warm-muted, #9A8A7A)" }}
                            >
                                {orders.length}
                            </span>
                        )}
                    </div>

                    {/* Body */}
                    {orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                                style={{ background: "rgba(184,77,34,0.08)" }}
                            >
                                <Package className="w-6 h-6" style={{ color: "var(--sama-terra, #B84D22)" }} />
                            </div>
                            <p className="font-bold text-foreground mb-1.5" style={{ fontSize: 15 }}>
                                Aucune commande
                            </p>
                            <p className="mb-5" style={{ fontSize: 13, color: "var(--sama-warm-muted, #9A8A7A)" }}>
                                Vous n'avez pas encore passé de commande
                            </p>
                            <Link
                                to="/catalogue"
                                className="inline-flex items-center gap-1.5 h-10 px-6 rounded-full text-[13px] font-semibold transition-all hover:opacity-90"
                                style={{ background: "var(--sama-terra, #B84D22)", color: "white" }}
                            >
                                Découvrir le catalogue
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y" style={{ borderColor: "rgba(0,0,0,0.05)" }}>
                            {orders.map((order, i) => (
                                <Link
                                    key={order.id}
                                    to={`/commande/suivi/${order.id}`}
                                    className="flex items-center justify-between px-6 py-4 group transition-colors hover:bg-[rgba(184,77,34,0.02)]"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <p
                                                className="font-mono font-bold"
                                                style={{ fontSize: 13, color: "var(--sama-dark, #0F0C0A)" }}
                                            >
                                                {order.numeroFacture ?? order.id.slice(0, 8).toUpperCase()}
                                            </p>
                                            <StatusBadge statut={order.statut} />
                                        </div>
                                        <p style={{ fontSize: 12, color: "var(--sama-warm-muted, #9A8A7A)" }}>
                                            {formatDate(order.createdAt, "dd MMMM yyyy")}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span
                                            className="font-bold"
                                            style={{ fontSize: 14, color: "var(--sama-terra, #B84D22)" }}
                                        >
                                            {formatPrice(order.totalTTC)}
                                        </span>
                                        <div
                                            className="w-7 h-7 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                                            style={{ background: "rgba(184,77,34,0.06)" }}
                                        >
                                            <ChevronRight
                                                className="w-3.5 h-3.5 transition-colors"
                                                style={{ color: "var(--sama-warm-muted, #9A8A7A)" }}
                                            />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}