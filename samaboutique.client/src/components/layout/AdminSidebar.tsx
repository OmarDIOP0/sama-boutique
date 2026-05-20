import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tag,
  Warehouse,
  ShoppingCart,
  Receipt,
  Users,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  AlertTriangle,
  Store,
} from "lucide-react";
import { cn, getInitials, roleLabel } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { useUIStore } from "@/stores/ui.store";
import { useStockAlerts } from "@/hooks/useProducts";
import { useLogout } from "@/hooks/useAuth";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Tableau de bord", end: true },
  { to: "/admin/products", icon: Package, label: "Produits" },
  { to: "/admin/categories", icon: Tag, label: "Catégories" },
  { to: "/admin/stock", icon: Warehouse, label: "Stock" },
  { to: "/admin/pos", icon: ShoppingCart, label: "Point de vente" },
  { to: "/admin/sales", icon: Receipt, label: "Ventes" },
  { to: "/admin/clients", icon: Users, label: "Clients" },
  { to: "/admin/orders", icon: ShoppingBag, label: "Commandes" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytiques" },
  { to: "/admin/settings", icon: Settings, label: "Paramètres" },
];

export function AdminSidebar() {
  const { user } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { data: alerts = [] } = useStockAlerts();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const stockAlertCount = alerts.length;

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-30 flex flex-col sidebar-gradient transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-64" : "w-16",
          "lg:translate-x-0",
          !sidebarOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-[--sidebar-border]">
          <button
            onClick={() => navigate("/")}
            className={cn(
              "flex items-center gap-3 overflow-hidden transition-all",
              !sidebarOpen && "lg:justify-center"
            )}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--sama-terra)" }}>
              <Store className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-[--sidebar-foreground] text-base whitespace-nowrap"
                style={{ fontFamily: "'Playfair Display', serif", letterSpacing: "0.01em" }}>
                SamaBoutique
              </span>
            )}
          </button>
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex w-6 h-6 rounded-lg items-center justify-center transition-colors"
            style={{ color: "var(--sidebar-muted)" }}
          >
            <ChevronLeft
              className={cn(
                "w-3.5 h-3.5 transition-transform duration-300",
                !sidebarOpen && "rotate-180"
              )}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
          <ul className="space-y-0.5">
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      "group relative flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-150",
                      isActive
                        ? "text-[--sidebar-primary]"
                        : "text-[--sidebar-foreground]/60 hover:text-[--sidebar-foreground] hover:bg-[--sidebar-border]",
                      !sidebarOpen && "lg:justify-center"
                    )
                  }
                  style={({ isActive }) =>
                    isActive
                      ? {
                          background: "var(--sidebar-accent)",
                          borderLeft: "3px solid var(--sama-terra)",
                          paddingLeft: sidebarOpen ? "calc(0.75rem - 3px)" : "calc(0.75rem - 3px)",
                        }
                      : {}
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cn(
                          "w-5 h-5 flex-shrink-0 transition-colors",
                          isActive
                            ? "text-[--sidebar-primary]"
                            : "text-[--sidebar-muted] group-hover:text-[--sidebar-foreground]"
                        )}
                      />
                      {sidebarOpen && (
                        <span className="truncate">{label}</span>
                      )}
                      {/* Stock alert badge */}
                      {label === "Produits" && stockAlertCount > 0 && (
                        <span className={cn(
                          "flex-shrink-0 bg-danger text-white text-xs rounded-full font-bold",
                          sidebarOpen
                            ? "ml-auto px-1.5 min-w-[18px] h-[18px] flex items-center justify-center"
                            : "absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[10px]"
                        )}>
                          {stockAlertCount}
                        </span>
                      )}
                      {/* Tooltip for collapsed */}
                      {!sidebarOpen && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-foreground text-background text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                          {label}
                        </div>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Stock alert strip */}
        {sidebarOpen && stockAlertCount > 0 && (
          <div className="mx-3 mb-3 p-3 rounded-xl"
            style={{ background: "rgba(196,98,45,0.08)", border: "1px solid rgba(196,98,45,0.2)" }}>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--sama-terra)" }} />
              <p className="text-xs font-medium" style={{ color: "var(--sama-terra)" }}>
                {stockAlertCount} alerte{stockAlertCount > 1 ? "s" : ""} stock
              </p>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-[--sidebar-border]" />

        {/* User profile */}
        <div className="p-3">
          <div className={cn(
            "flex items-center gap-3",
            !sidebarOpen && "lg:justify-center"
          )}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--sama-terra-light)", border: "1.5px solid var(--sama-terra)" }}>
              <span className="text-sm font-bold" style={{ color: "var(--sama-terra)" }}>
                {user ? getInitials(user.nom) : "?"}
              </span>
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: "var(--sidebar-foreground)" }}>
                    {user?.nom}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--sidebar-muted)" }}>
                    {user ? roleLabel(user.role) : ""}
                  </p>
                </div>
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-danger/10 hover:text-danger"
                  style={{ color: "var(--sidebar-muted)" }}
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
