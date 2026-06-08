import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, Tag, Boxes, ShoppingCart, TrendingUp,
  Users, ClipboardList, BarChart3, Settings, LogOut, ChevronLeft,
  AlertTriangle, ExternalLink,
} from "lucide-react";
import { cn, getInitials, roleLabel } from "@/lib/utils";
import { AdminIcon, type AdminIconColor } from "@/components/admin/ui";
import { useAuthStore } from "@/stores/auth.store";
import { useUIStore } from "@/stores/ui.store";
import { useStockAlerts } from "@/hooks/useProducts";
import { useLogout } from "@/hooks/useAuth";

const navItems: { to: string; icon: React.ElementType; label: string; color: AdminIconColor; end?: boolean }[] = [
  { to: "/admin", icon: LayoutDashboard, label: "Tableau de bord", color: "amber", end: true },
  { to: "/admin/products", icon: Package, label: "Produits", color: "brown" },
  { to: "/admin/categories", icon: Tag, label: "Catégories", color: "orange" },
  { to: "/admin/stock", icon: Boxes, label: "Stock", color: "green" },
  { to: "/admin/pos", icon: ShoppingCart, label: "Point de vente", color: "teal" },
  { to: "/admin/sales", icon: TrendingUp, label: "Ventes", color: "amber" },
  { to: "/admin/clients", icon: Users, label: "Clients", color: "purple" },
  { to: "/admin/orders", icon: ClipboardList, label: "Commandes", color: "blue" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytiques", color: "blue" },
  { to: "/admin/settings", icon: Settings, label: "Paramètres", color: "brown" },
];

const DARK = "#513102";
const GOLD = "#C7932D";
const CREAM = "#FFF8EE";

export function AdminSidebar() {
  const { user } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { data: alerts = [] } = useStockAlerts();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const stockAlertCount = alerts.length;

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 lg:hidden" style={{ background: "rgba(26,16,8,0.45)" }} onClick={toggleSidebar} />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-30 flex flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-16",
          "lg:translate-x-0",
          !sidebarOpen && "-translate-x-full lg:translate-x-0"
        )}
        style={{ background: DARK }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5" style={{ borderBottom: "1px solid rgba(255,248,238,0.10)" }}>
          <button
            onClick={() => navigate("/admin")}
            className={cn("flex items-center gap-3 overflow-hidden", !sidebarOpen && "lg:justify-center")}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: GOLD, boxShadow: "0 2px 10px rgba(199,147,45,0.40)" }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, fontSize: 18, color: CREAM }}>S</span>
            </div>
            {sidebarOpen && (
              <span className="whitespace-nowrap" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 17, color: CREAM }}>
                Sama<span style={{ fontStyle: "italic", color: GOLD }}>Boutique</span>
              </span>
            )}
          </button>
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex w-6 h-6 rounded-lg items-center justify-center transition-colors"
            style={{ color: "rgba(255,248,238,0.50)" }}
          >
            <ChevronLeft className={cn("w-3.5 h-3.5 transition-transform duration-300", !sidebarOpen && "rotate-180")} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
          <ul className="space-y-1">
            {navItems.map(({ to, icon: Icon, label, color, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all duration-150",
                      !sidebarOpen && "lg:justify-center"
                    )
                  }
                  style={({ isActive }) =>
                    isActive
                      ? { background: "rgba(199,147,45,0.20)", borderLeft: `3px solid ${GOLD}`, paddingLeft: "calc(0.625rem - 3px)" }
                      : { borderLeft: "3px solid transparent" }
                  }
                >
                  {({ isActive }) => (
                    <>
                      <AdminIcon icon={Icon} color={color} size="sm" />
                      {sidebarOpen && (
                        <span className="truncate" style={{ fontSize: 14, fontWeight: isActive ? 600 : 500, color: isActive ? GOLD : "rgba(255,248,238,0.75)" }}>
                          {label}
                        </span>
                      )}
                      {/* Badge alerte stock sur Produits */}
                      {label === "Produits" && stockAlertCount > 0 && (
                        <span className={cn(
                          "flex-shrink-0 text-white rounded-full font-bold flex items-center justify-center",
                          sidebarOpen ? "ml-auto px-1.5 min-w-[18px] h-[18px] text-[11px]" : "absolute top-1 right-1 w-4 h-4 text-[9px]"
                        )} style={{ background: GOLD }} title={`${stockAlertCount} produit(s) en stock bas`}>
                          {stockAlertCount}
                        </span>
                      )}
                      {/* Tooltip collapsed */}
                      {!sidebarOpen && (
                        <div className="absolute left-full ml-2 px-2 py-1 text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
                          style={{ background: DARK, color: CREAM, border: `1px solid ${GOLD}` }}>
                          {label}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Boutique en ligne */}
          {sidebarOpen && (
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
              style={{ borderLeft: "3px solid transparent" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,248,238,0.06)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <ExternalLink className="w-5 h-5 flex-shrink-0" style={{ color: "rgba(255,248,238,0.55)" }} />
              <span className="truncate" style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,248,238,0.75)" }}>
                Boutique en ligne
              </span>
            </a>
          )}
        </nav>

        {/* Alerte stock */}
        {sidebarOpen && stockAlertCount > 0 && (
          <button
            onClick={() => navigate("/admin/stock")}
            className="mx-3 mb-3 p-3 rounded-xl text-left transition-all hover:brightness-105"
            style={{ background: "rgba(199,147,45,0.14)", border: "1px solid rgba(199,147,45,0.30)" }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: GOLD }} />
              <p style={{ fontSize: 12, fontWeight: 600, color: GOLD }}>
                {stockAlertCount} alerte{stockAlertCount > 1 ? "s" : ""} stock
              </p>
            </div>
          </button>
        )}

        {/* Profil utilisateur */}
        <div className="p-3" style={{ borderTop: "1px solid rgba(255,248,238,0.10)" }}>
          <div className={cn("flex items-center gap-3", !sidebarOpen && "lg:justify-center")}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(199,147,45,0.18)", border: `1.5px solid ${GOLD}` }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>
                {user ? getInitials(user.nom) : "?"}
              </span>
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="truncate" style={{ fontSize: 14, fontWeight: 600, color: CREAM }}>{user?.nom}</p>
                  <p className="truncate" style={{ fontSize: 12, color: "rgba(255,248,238,0.50)" }}>{user ? roleLabel(user.role) : ""}</p>
                </div>
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                  style={{ color: "rgba(255,248,238,0.55)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.20)"; (e.currentTarget as HTMLElement).style.color = "#fca5a5"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,248,238,0.55)"; }}
                  title="Déconnexion"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
