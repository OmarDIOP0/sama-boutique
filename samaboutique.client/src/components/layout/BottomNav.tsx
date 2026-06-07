import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingCart, User, Package } from "lucide-react";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";

const TABS = [
    { to: "/",        icon: Home,         label: "Accueil" },
    { to: "/?search", icon: Search,        label: "Recherche", isSearch: true },
    { to: "/panier",  icon: ShoppingCart,  label: "Panier",   hasBadge: true },
    { to: "/compte",  icon: Package,       label: "Commandes", authRequired: true },
    { to: "/login",   icon: User,          label: "Compte",   guestOnly: true },
];

export function BottomNav() {
    const location = useLocation();
    const cartCount = useCartStore((s) => s.totalItems());
    const { user } = useAuthStore();

    // Ne pas afficher sur admin
    if (location.pathname.startsWith("/admin")) return null;

    const tabs = TABS.filter(t => {
        if (t.authRequired && !user) return false;
        if (t.guestOnly && user) return false;
        return true;
    });

    return (
        <nav
            className="fixed bottom-0 inset-x-0 z-40 lg:hidden"
            style={{
                background: "rgba(255,248,238,0.97)",
                backdropFilter: "blur(16px)",
                borderTop: "1px solid rgba(81,49,2,0.08)",
                boxShadow: "0 -4px 24px rgba(81,49,2,0.08)",
                paddingBottom: "env(safe-area-inset-bottom, 0px)",
            }}
        >
            <div className="flex items-center" style={{ height: 60 }}>
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = tab.to === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(tab.to.split("?")[0]);

                    return (
                        <Link
                            key={tab.to}
                            to={tab.to}
                            className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full relative transition-all"
                            style={{ color: active ? "#C7932D" : "rgba(81,49,2,0.45)", cursor: "pointer" }}
                        >
                            <div className="relative">
                                <Icon
                                    style={{
                                        width: 21, height: 21,
                                        strokeWidth: active ? 2.2 : 1.7,
                                        transition: "all 0.2s",
                                        transform: active ? "scale(1.1)" : "scale(1)",
                                    }}
                                />
                                {tab.hasBadge && cartCount > 0 && (
                                    <span
                                        className="absolute flex items-center justify-center text-white"
                                        style={{
                                            top: -5, right: -6,
                                            minWidth: 16, height: 16,
                                            background: "#C7932D",
                                            borderRadius: 100,
                                            fontSize: 9, fontWeight: 800,
                                            border: "1.5px solid #FFF8EE",
                                            padding: "0 3px",
                                        }}
                                    >
                                        {cartCount > 9 ? "9+" : cartCount}
                                    </span>
                                )}
                            </div>
                            <span style={{
                                fontSize: 10, fontWeight: active ? 700 : 500,
                                letterSpacing: active ? "0.01em" : 0,
                                transition: "all 0.2s",
                            }}>
                                {tab.label}
                            </span>
                            {active && (
                                <div
                                    className="absolute bottom-0 inset-x-3 rounded-t-full"
                                    style={{ height: 2.5, background: "#C7932D" }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
