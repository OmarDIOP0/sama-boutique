import { Menu, Bell, Sun, Moon, WifiOff } from "lucide-react";
import { useUIStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { cn, getInitials } from "@/lib/utils";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Titre de page selon la route
const PAGE_TITLES: { match: (p: string) => boolean; title: string }[] = [
  { match: (p) => p === "/admin", title: "Tableau de bord" },
  { match: (p) => p.startsWith("/admin/products"), title: "Produits" },
  { match: (p) => p.startsWith("/admin/categories"), title: "Catégories" },
  { match: (p) => p.startsWith("/admin/stock"), title: "Stock" },
  { match: (p) => p.startsWith("/admin/pos"), title: "Point de vente" },
  { match: (p) => p.startsWith("/admin/sales"), title: "Ventes" },
  { match: (p) => p.startsWith("/admin/clients"), title: "Clients" },
  { match: (p) => p.startsWith("/admin/orders"), title: "Commandes" },
  { match: (p) => p.startsWith("/admin/analytics"), title: "Analytiques" },
  { match: (p) => p.startsWith("/admin/settings"), title: "Paramètres" },
];

const DARK = "#513102";
const GOLD = "#C7932D";

export function AdminTopbar() {
  const { toggleSidebar, theme, toggleTheme, isOnline, notifications } = useUIStore();
  const { user } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const pageTitle = PAGE_TITLES.find((t) => t.match(location.pathname))?.title ?? "Administration";

  return (
    <header
      className="sticky top-0 z-10 h-16 flex items-center gap-3 px-6"
      style={{
        background: "rgba(255,248,238,0.90)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(81,49,2,0.08)",
      }}
    >
      {/* Mobile menu toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
        style={{ color: DARK, cursor: "pointer" }}
        aria-label="Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title */}
      <h1 className="hidden sm:block" style={{ fontSize: 22, fontWeight: 700, color: DARK, fontFamily: "'Playfair Display', Georgia, serif" }}>
        {pageTitle}
      </h1>

      <div className="flex-1" />

      {/* Offline indicator */}
      {!isOnline && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(199,147,45,0.12)" }}>
          <WifiOff className="w-3 h-3" style={{ color: GOLD }} />
          <span style={{ fontSize: 12, fontWeight: 500, color: GOLD }}>Hors ligne</span>
        </div>
      )}

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
        style={{ color: "rgba(81,49,2,0.55)", cursor: "pointer" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(199,147,45,0.10)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        title={theme === "light" ? "Mode sombre" : "Mode clair"}
        aria-label="Changer le thème"
      >
        {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ color: "rgba(81,49,2,0.55)", cursor: "pointer" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(199,147,45,0.10)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              style={{ width: 16, height: 16, background: "#DC2626", border: "2px solid #FFF8EE" }}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
            <div className="absolute right-0 top-11 w-72 rounded-2xl z-20 overflow-hidden admin-card"
              style={{ boxShadow: "0 16px 48px rgba(81,49,2,0.18)" }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(81,49,2,0.08)" }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: DARK }}>Notifications</h4>
                {unreadCount > 0 && (
                  <button onClick={() => useUIStore.getState().markAllRead()}
                    className="hover:underline" style={{ fontSize: 12, color: GOLD, cursor: "pointer" }}>
                    Tout lire
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <p className="text-center py-8" style={{ fontSize: 13, color: "rgba(81,49,2,0.45)" }}>Aucune notification</p>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div key={n.id} className="px-4 py-3 last:border-0"
                      style={{ borderBottom: "1px solid rgba(81,49,2,0.05)", background: !n.read ? "rgba(199,147,45,0.05)" : "transparent" }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: DARK }}>{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* User avatar */}
      <button
        onClick={() => navigate("/admin/settings")}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
        style={{ background: "rgba(199,147,45,0.12)", border: `1.5px solid ${GOLD}`, cursor: "pointer" }}
        aria-label="Mon profil"
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>
          {user ? getInitials(user.nom) : "?"}
        </span>
      </button>
    </header>
  );
}
