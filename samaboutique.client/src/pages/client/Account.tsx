import { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, ArrowRight, Package, ShoppingBag, ChevronRight, ChevronLeft, Pencil, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useOrders } from "@/hooks/useOrders";
import { useAuthStore } from "@/stores/auth.store";
import { useLogout, useUpdateProfile } from "@/hooks/useAuth";
import { formatPrice, formatDate } from "@/lib/utils";

/* ── Status helpers ─────────────────────────────────────────────────────────── */
const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    Livree: { label: "Livrée", bg: "rgba(34,197,94,0.08)", text: "#16a34a", dot: "#22C55E" },
    EnAttente: { label: "En attente", bg: "rgba(234,179,8,0.08)", text: "#b45309", dot: "#EAB308" },
    Confirmee: { label: "Confirmée", bg: "rgba(59,130,246,0.08)", text: "#2563eb", dot: "#3B82F6" },
    Annulee: { label: "Annulée", bg: "rgba(239,68,68,0.08)", text: "#dc2626", dot: "#EF4444" },
    EnCours: { label: "En cours", bg: "rgba(168,85,247,0.08)", text: "#7c3aed", dot: "#A855F7" },
};

function StatusBadge({ statut }: { statut: string }) {
    const s = STATUS_MAP[statut] ?? { label: statut, bg: "rgba(81,49,2,0.04)", text: "rgba(81,49,2,0.55)", dot: "rgba(81,49,2,0.40)" };
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
    const updateProfile = useUpdateProfile();
    const [page, setPage] = useState(1);
    const { data: ordersData } = useOrders({ page, pageSize: 8 });

    // Édition profil
    const [editing, setEditing] = useState(false);
    const [nom, setNom] = useState(user?.nom ?? "");
    const [telephone, setTelephone] = useState((user as any)?.telephone ?? "");

    const orders = ordersData?.data ?? [];
    const pagination = ordersData?.pagination;
    const initial = user?.nom?.[0]?.toUpperCase() ?? "?";

    const openEdit = () => { setNom(user?.nom ?? ""); setTelephone((user as any)?.telephone ?? ""); setEditing(true); };
    const saveProfile = () => {
        if (nom.trim().length < 2) { toast.error("Le nom doit contenir au moins 2 caractères"); return; }
        updateProfile.mutate(
            { nom: nom.trim(), telephone: telephone.trim() || undefined },
            { onSuccess: () => { setEditing(false); toast.success("Profil mis à jour"); }, onError: (e) => toast.error((e as Error).message) }
        );
    };

    return (
        <div className="min-h-screen wurus-bg">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">

                {/* ── Section title ────────────────────────────────────────────────── */}
                <div className="flex items-center gap-2.5">
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
                        Mon compte
                    </h1>
                </div>

                {/* ── Profile card ─────────────────────────────────────────────────── */}
                <div className="wurus-card p-6 sm:p-7">
                    <div className="flex flex-wrap items-center gap-5">
                        {/* Avatar */}
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(199,147,45,0.10)" }}
                        >
                            <span
                                className="text-xl font-bold"
                                style={{ color: "#C7932D", fontFamily: "'Playfair Display', Georgia, serif" }}
                            >
                                {initial}
                            </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h2 className="font-bold" style={{ fontSize: 16, color: "#513102" }}>
                                {user?.nom}
                            </h2>
                            <p style={{ fontSize: 13, color: "rgba(81,49,2,0.55)" }}>
                                {user?.email}
                            </p>
                            <span
                                className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-widest uppercase"
                                style={{
                                    background: "rgba(199,147,45,0.06)",
                                    color: "#C7932D",
                                    letterSpacing: "0.08em",
                                }}
                            >
                                {user?.role}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={openEdit}
                                className="flex items-center gap-2 h-9 px-4 rounded-full text-[12px] font-semibold transition-all hover:opacity-90"
                                style={{ background: "rgba(199,147,45,0.10)", color: "#C7932D", border: "1.5px solid rgba(199,147,45,0.30)" }}
                            >
                                <Pencil className="w-3.5 h-3.5" />
                                Modifier
                            </button>
                            <button
                                onClick={() => logoutMutation.mutate()}
                                className="flex items-center gap-2 h-9 px-4 rounded-full text-[12px] font-medium transition-all hover:opacity-75"
                                style={{ border: "1.5px solid rgba(81,49,2,0.12)", color: "rgba(81,49,2,0.55)", background: "transparent" }}
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                Déconnexion
                            </button>
                        </div>
                    </div>

                    {/* Formulaire d'édition inline */}
                    {editing && (
                        <div className="mt-5 pt-5 space-y-3" style={{ borderTop: "1px solid rgba(81,49,2,0.08)" }}>
                            <div className="flex items-center justify-between">
                                <p style={{ fontSize: 13, fontWeight: 700, color: "#513102" }}>Modifier mon profil</p>
                                <button onClick={() => setEditing(false)} style={{ color: "rgba(81,49,2,0.45)", cursor: "pointer" }}><X className="w-4 h-4" /></button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(81,49,2,0.55)", display: "block", marginBottom: 5 }}>Nom complet</label>
                                    <input value={nom} onChange={(e) => setNom(e.target.value)} className="wurus-input" placeholder="Votre nom" />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(81,49,2,0.55)", display: "block", marginBottom: 5 }}>Téléphone</label>
                                    <input value={telephone} onChange={(e) => setTelephone(e.target.value)} className="wurus-input" placeholder="+221 77 000 00 00" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 pt-1">
                                <button onClick={saveProfile} disabled={updateProfile.isPending}
                                    className="flex items-center justify-center gap-2 h-11 px-5 rounded-full font-bold disabled:opacity-50"
                                    style={{ background: "#C7932D", color: "white", fontSize: 14, cursor: "pointer" }}>
                                    {updateProfile.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Enregistrer
                                </button>
                                <button onClick={() => setEditing(false)}
                                    className="h-11 px-5 rounded-full font-medium"
                                    style={{ border: "1.5px solid rgba(81,49,2,0.15)", color: "rgba(81,49,2,0.60)", fontSize: 14, cursor: "pointer", background: "transparent" }}>
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Orders section ───────────────────────────────────────────────── */}
                <div className="wurus-card overflow-hidden">
                    {/* Header */}
                    <div
                        className="px-6 py-4 flex items-center justify-between"
                        style={{ borderBottom: "1px solid rgba(81,49,2,0.06)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{ background: "rgba(199,147,45,0.10)" }}
                            >
                                <ShoppingBag className="w-3.5 h-3.5" style={{ color: "#C7932D" }} />
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
                                Mes commandes
                            </span>
                        </div>
                        {(pagination?.totalCount ?? orders.length) > 0 && (
                            <span
                                className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                style={{ background: "rgba(199,147,45,0.08)", color: "rgba(81,49,2,0.65)" }}
                            >
                                {pagination?.totalCount ?? orders.length}
                            </span>
                        )}
                    </div>

                    {/* Body */}
                    {orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <div
                                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                                style={{ background: "rgba(199,147,45,0.10)" }}
                            >
                                <Package className="w-6 h-6" style={{ color: "#C7932D" }} />
                            </div>
                            <p className="font-bold mb-1.5" style={{ fontSize: 15, color: "#513102" }}>
                                Aucune commande
                            </p>
                            <p className="mb-5" style={{ fontSize: 13, color: "rgba(81,49,2,0.55)" }}>
                                Vous n'avez pas encore passé de commande
                            </p>
                            <Link
                                to="/"
                                className="inline-flex items-center gap-1.5 h-10 px-6 rounded-full text-[13px] font-semibold transition-all hover:opacity-90 wurus-btn-primary"
                            >
                                Découvrir le catalogue
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y" style={{ borderColor: "rgba(81,49,2,0.05)" }}>
                            {orders.map((order) => (
                                <Link
                                    key={order.id}
                                    to={`/commande/suivi/${order.id}`}
                                    className="flex items-center justify-between px-6 py-4 group transition-colors"
                                    style={{ background: "transparent" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(199,147,45,0.03)"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3 mb-1.5">
                                            <p
                                                className="font-mono font-bold"
                                                style={{ fontSize: 13, color: "#513102" }}
                                            >
                                                {order.numeroFacture ?? order.id.slice(0, 8).toUpperCase()}
                                            </p>
                                            <StatusBadge statut={order.statut} />
                                        </div>
                                        <p style={{ fontSize: 12, color: "rgba(81,49,2,0.55)" }}>
                                            {formatDate(order.createdAt, "dd MMMM yyyy")}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span
                                            className="font-bold"
                                            style={{ fontSize: 14, color: "#C7932D" }}
                                        >
                                            {formatPrice(order.totalTTC)}
                                        </span>
                                        <div
                                            className="w-7 h-7 rounded-full flex items-center justify-center transition-all group-hover:scale-110"
                                            style={{ background: "rgba(199,147,45,0.08)" }}
                                        >
                                            <ChevronRight
                                                className="w-3.5 h-3.5"
                                                style={{ color: "rgba(81,49,2,0.45)" }}
                                            />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: "1px solid rgba(81,49,2,0.06)" }}>
                            <p style={{ fontSize: 12, color: "rgba(81,49,2,0.50)" }}>
                                Page <strong style={{ color: "#513102" }}>{pagination.page}</strong> / {pagination.totalPages}
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={!pagination.hasPrevious}
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
                                    style={{ border: "1.5px solid rgba(81,49,2,0.12)", color: "#513102", cursor: pagination.hasPrevious ? "pointer" : "not-allowed" }}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={!pagination.hasNext}
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
                                    style={{ border: "1.5px solid rgba(81,49,2,0.12)", color: "#513102", cursor: pagination.hasNext ? "pointer" : "not-allowed" }}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}