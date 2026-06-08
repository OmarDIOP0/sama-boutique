import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingCart, Package, User, Heart } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import { useWishlistStore } from "@/stores/wishlist.store";

export function BottomNav() {
    const location = useLocation();
    const cartCount = useCartStore((s) => s.totalItems());
    const favCount = useWishlistStore((s) => s.productIds.length);
    const { user } = useAuthStore();

    if (location.pathname.startsWith("/admin")) return null;

    const tabs = [
        { to: "/",        icon: Home,         label: "Accueil",   exact: true },
        { to: user ? "/favoris" : "/login", icon: Heart, label: "Favoris", badge: favCount },
        { to: "/panier",  icon: ShoppingCart, label: "Panier",    badge: cartCount },
        { to: user ? "/compte" : "/login", icon: Package, label: "Commandes" },
        { to: user ? "/compte" : "/login", icon: User, label: user ? user.nom?.split(" ")[0] ?? "Compte" : "Connexion" },
    ];

    return (
        <nav
            className="fixed bottom-0 inset-x-0 z-40 lg:hidden"
            style={{
                background: "rgba(255,248,238,0.97)",
                backdropFilter: "blur(16px)",
                borderTop: "1px solid rgba(81,49,2,0.08)",
                boxShadow: "0 -4px 24px rgba(81,49,2,0.06)",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
        >
            <div className="grid grid-cols-5" style={{ height: 58 }}>
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = tab.exact
                        ? location.pathname === tab.to
                        : location.pathname.startsWith(tab.to) && tab.to !== "/login";

                    return (
                        <Link
                            key={tab.label}
                            to={tab.to}
                            className="flex flex-col items-center justify-center gap-0.5 relative transition-all"
                            style={{ color: active ? "#C7932D" : "rgba(81,49,2,0.40)", cursor: "pointer" }}
                        >
                            <div className="relative">
                                <Icon style={{ width: 20, height: 20, strokeWidth: active ? 2.2 : 1.7 }} />
                                {(tab.badge ?? 0) > 0 && (
                                    <span className="absolute flex items-center justify-center text-white"
                                        style={{ top: -5, right: -6, minWidth: 15, height: 15, background: "#C7932D", borderRadius: 100, fontSize: 8, fontWeight: 800, border: "1.5px solid #FFF8EE", padding: "0 2px" }}>
                                        {(tab.badge ?? 0) > 9 ? "9+" : tab.badge}
                                    </span>
                                )}
                            </div>
                            <span style={{ fontSize: 9.5, fontWeight: active ? 700 : 500, maxWidth: 56, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {tab.label}
                            </span>
                            {active && (
                                <div className="absolute top-0 inset-x-4 rounded-b-full" style={{ height: 2.5, background: "#C7932D" }} />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
