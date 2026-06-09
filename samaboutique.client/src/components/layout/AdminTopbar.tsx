import { Menu, Bell, Sun, Moon, WifiOff, Banknote, Trash2, ChevronDown, User, Lock, Store, LogOut } from "lucide-react";
import { useUIStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { useTheme } from "@/hooks/useTheme";
import { useLogout } from "@/hooks/useAuth";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn, getInitials, formatPrice, roleLabel } from "@/lib/utils";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Temps relatif court (il y a 5 min, 2 h, etc.)
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}

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
  const { toggleSidebar, isOnline, notifications } = useUIStore();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuthStore();
  const logoutMutation = useLogout();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useClickOutside<HTMLDivElement>(() => setShowProfile(false), showProfile);
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
            <div className="absolute right-0 top-11 w-80 rounded-2xl z-20 overflow-hidden admin-card"
              style={{ boxShadow: "0 16px 48px rgba(81,49,2,0.18)" }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(81,49,2,0.08)" }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: DARK }}>Notifications</h4>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button onClick={() => useUIStore.getState().markAllRead()}
                      className="hover:underline" style={{ fontSize: 12, color: GOLD, cursor: "pointer" }}>
                      Tout lire
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button onClick={() => useUIStore.getState().clearNotifications()}
                      className="flex items-center gap-1 hover:opacity-70" style={{ fontSize: 12, color: "rgba(81,49,2,0.45)", cursor: "pointer" }}
                      title="Tout effacer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center py-10">
                    <Bell className="w-7 h-7 mb-2" style={{ color: "rgba(81,49,2,0.20)" }} />
                    <p style={{ fontSize: 13, color: "rgba(81,49,2,0.45)" }}>Aucune notification</p>
                  </div>
                ) : (
                  notifications.slice(0, 20).map((n) => {
                    const isPayment = n.type === "payment";
                    return (
                      <div key={n.id} className="px-4 py-3 flex items-start gap-3 last:border-0"
                        style={{ borderBottom: "1px solid rgba(81,49,2,0.05)", background: !n.read ? "rgba(199,147,45,0.05)" : "transparent" }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: isPayment ? "rgba(45,122,79,0.12)" : "rgba(199,147,45,0.10)" }}>
                          {isPayment
                            ? <Banknote className="w-4 h-4" style={{ color: "#2D7A4F" }} />
                            : <Bell className="w-4 h-4" style={{ color: GOLD }} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          {isPayment && n.amount != null ? (
                            <>
                              <p style={{ fontSize: 14, fontWeight: 700, color: "#2D7A4F" }}>{formatPrice(n.amount)}</p>
                              <p style={{ fontSize: 12, color: "rgba(81,49,2,0.55)" }}>
                                {n.message.replace(/^Paiement reçu — [^·]*/, "Paiement reçu")}
                              </p>
                            </>
                          ) : (
                            <p style={{ fontSize: 13, fontWeight: 500, color: DARK }}>{n.message}</p>
                          )}
                          <p style={{ fontSize: 11, color: "rgba(81,49,2,0.40)", marginTop: 2 }}>{relativeTime(n.createdAt)}</p>
                        </div>
                        {!n.read && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: GOLD }} />}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Profil — dropdown */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setShowProfile((v) => !v)}
          className="flex items-center gap-2 pl-1 pr-2 h-10 rounded-full transition-colors"
          style={{ cursor: "pointer" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(199,147,45,0.08)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          aria-label="Mon profil"
        >
          <span className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(199,147,45,0.12)", border: `1.5px solid ${GOLD}` }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>{user ? getInitials(user.nom) : "?"}</span>
          </span>
          <span className="hidden md:block" style={{ fontSize: 13.5, fontWeight: 600, color: DARK }}>{user?.nom?.split(" ")[0]}</span>
          <ChevronDown className="hidden md:block w-3.5 h-3.5" style={{ color: "rgba(81,49,2,0.45)", transform: showProfile ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>

        {showProfile && (
          <div className="absolute right-0 top-12 rounded-2xl z-30 overflow-hidden admin-card"
            style={{ width: 250, boxShadow: "0 16px 48px rgba(81,49,2,0.18)", animation: "adminSlideUp 0.18s ease" }}>
            {/* En-tête */}
            <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid rgba(81,49,2,0.06)" }}>
              <span className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(199,147,45,0.12)", border: `1.5px solid ${GOLD}` }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>{user ? getInitials(user.nom) : "?"}</span>
              </span>
              <div className="min-w-0">
                <p className="truncate" style={{ fontSize: 14, fontWeight: 700, color: DARK }}>{user?.nom}</p>
                <p className="truncate" style={{ fontSize: 12, color: "rgba(81,49,2,0.50)" }}>{user?.email}</p>
              </div>
            </div>

            {/* Items */}
            <div className="py-1.5">
              {[
                { icon: User, label: "Mon profil", action: () => navigate("/admin/settings") },
                { icon: Bell, label: "Préférences notifs", action: () => navigate("/admin/settings") },
                { icon: Lock, label: "Changer mot de passe", action: () => navigate("/admin/settings") },
              ].map(({ icon: Icon, label, action }) => (
                <button key={label} onClick={() => { setShowProfile(false); action(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(199,147,45,0.06)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(81,49,2,0.55)" }} />
                  <span style={{ fontSize: 14, color: DARK }}>{label}</span>
                </button>
              ))}

              {/* Mode sombre toggle */}
              <div className="flex items-center justify-between px-4 py-2.5">
                <div className="flex items-center gap-3">
                  {theme === "dark" ? <Sun className="w-4 h-4" style={{ color: "rgba(81,49,2,0.55)" }} /> : <Moon className="w-4 h-4" style={{ color: "rgba(81,49,2,0.55)" }} />}
                  <span style={{ fontSize: 14, color: DARK }}>Mode sombre</span>
                </div>
                <button onClick={toggleTheme} className="relative w-10 h-5.5 rounded-full transition-all"
                  style={{ width: 40, height: 22, background: theme === "dark" ? GOLD : "rgba(81,49,2,0.15)", cursor: "pointer" }}>
                  <span className="absolute top-0.5 rounded-full bg-white shadow transition-transform"
                    style={{ width: 18, height: 18, left: theme === "dark" ? 20 : 2 }} />
                </button>
              </div>
            </div>

            {/* Boutique en ligne */}
            <div className="py-1.5" style={{ borderTop: "1px solid rgba(81,49,2,0.06)" }}>
              <a href="/" target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(199,147,45,0.06)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                <Store className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(81,49,2,0.55)" }} />
                <span style={{ fontSize: 14, color: DARK }}>Voir la boutique</span>
                <span className="ml-auto" style={{ fontSize: 12, color: "rgba(81,49,2,0.35)" }}>↗</span>
              </a>
            </div>

            {/* Déconnexion */}
            <div className="py-1.5" style={{ borderTop: "1px solid rgba(81,49,2,0.06)" }}>
              <button onClick={() => { setShowProfile(false); logoutMutation.mutate(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors"
                style={{ cursor: "pointer" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(220,38,38,0.06)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                <LogOut className="w-4 h-4 flex-shrink-0" style={{ color: "#DC2626" }} />
                <span style={{ fontSize: 14, fontWeight: 500, color: "#DC2626" }}>Déconnexion</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
