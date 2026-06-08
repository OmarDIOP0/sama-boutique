import { Link, Navigate } from "react-router-dom";
import { Heart, ArrowRight, Trash2 } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useWishlistStore } from "@/stores/wishlist.store";
import { useAuthStore } from "@/stores/auth.store";
import { StoreIcon } from "@/components/shared/StoreIcon";
import { ProductCard } from "./Home";

export default function Favorites() {
    const { user } = useAuthStore();
    const wishlist = useWishlistStore();
    const { data, isLoading } = useProducts({ page: 1, pageSize: 100, statut: "Actif" });

    // Favoris réservés aux utilisateurs connectés
    if (!user) return <Navigate to="/login" />;

    const favIds = wishlist.productIds;
    const favProducts = (data?.data ?? []).filter((p) => favIds.includes(p.id));

    return (
        <div className="min-h-screen wurus-bg">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

                {/* Title */}
                <div className="flex items-center justify-between gap-3 mb-7">
                    <div className="flex items-center gap-2.5">
                        <div className="w-1 h-6 rounded-full" style={{ background: "#C7932D" }} />
                        <div>
                            <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", color: "#513102" }}>
                                Mes favoris
                            </h1>
                            <p style={{ fontSize: 13, color: "rgba(81,49,2,0.50)" }}>
                                {favProducts.length} produit{favProducts.length > 1 ? "s" : ""} enregistré{favProducts.length > 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                    {favIds.length > 0 && (
                        <button
                            onClick={() => wishlist.clear()}
                            className="flex items-center gap-1.5 px-3.5 h-9 rounded-full font-semibold transition-all hover:opacity-80"
                            style={{ fontSize: 12, border: "1.5px solid rgba(239,68,68,0.25)", color: "#DC2626", background: "rgba(239,68,68,0.04)", cursor: "pointer" }}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Tout retirer
                        </button>
                    )}
                </div>

                {/* Loading */}
                {isLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="sama-skeleton aspect-square" style={{ borderRadius: 16, background: "rgba(81,49,2,0.05)" }} />
                                <div className="sama-skeleton h-2.5 w-2/3 rounded-full" style={{ background: "rgba(81,49,2,0.05)" }} />
                            </div>
                        ))}
                    </div>
                ) : favProducts.length === 0 ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="mb-5">
                            <StoreIcon icon={Heart} color="amber" size="lg" />
                        </div>
                        <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: "'Playfair Display', serif", fontStyle: "italic", color: "#513102", marginBottom: 8 }}>
                            Aucun favori pour le moment
                        </h2>
                        <p className="mb-7 max-w-sm" style={{ fontSize: 14, color: "rgba(81,49,2,0.55)" }}>
                            Cliquez sur le ❤️ d'un produit pour l'ajouter à vos favoris et le retrouver ici.
                        </p>
                        <Link to="/"
                            className="inline-flex items-center gap-2 px-6 font-semibold rounded-full transition-all hover:opacity-90"
                            style={{ height: 46, background: "#513102", color: "#FFF8EE", fontSize: 14, textDecoration: "none" }}>
                            Découvrir le catalogue
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    /* Grid */
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                        {favProducts.map((product, i) => (
                            <ProductCard key={product.id} product={product} index={i} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
