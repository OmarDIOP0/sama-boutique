import { Menu, Bell, Sun, Moon, WifiOff } from "lucide-react";
import { useUIStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { cn, getInitials } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function AdminTopbar() {
  const { toggleSidebar, sidebarOpen, theme, toggleTheme, isOnline, notifications } =
    useUIStore();
  const { user } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-10 h-14 flex items-center gap-3 px-4 bg-background/90 backdrop-blur-md border-b border-border/50">
      {/* Mobile menu toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Offline indicator */}
      {!isOnline && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-warning/10 rounded-full">
          <WifiOff className="w-3 h-3 text-warning" />
          <span className="text-xs font-medium text-warning">Hors ligne</span>
        </div>
      )}

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
        title={theme === "light" ? "Mode sombre" : "Mode clair"}
      >
        {theme === "light" ? (
          <Moon className="w-4 h-4" />
        ) : (
          <Sun className="w-4 h-4" />
        )}
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {showNotifications && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
            <div className="absolute right-0 top-10 w-72 bg-card rounded-2xl shadow-2xl border border-border/60 z-20 overflow-hidden">
              <div className="p-4 border-b border-border/60 flex items-center justify-between">
                <h4 className="text-sm font-semibold">Notifications</h4>
                {unreadCount > 0 && (
                  <button
                    onClick={() => useUIStore.getState().markAllRead()}
                    className="text-xs hover:underline"
                    style={{ color: "var(--sama-terra)" }}
                  >
                    Tout lire
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    Aucune notification
                  </p>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "px-4 py-3 border-b border-border/40 last:border-0 text-xs",
                        !n.read && "bg-primary/5"
                      )}
                    >
                      <p className="font-medium text-foreground">{n.message}</p>
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
        className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
        style={{
          background: "var(--sama-terra-light)",
          border: "1.5px solid var(--sama-terra)",
        }}
      >
        <span className="text-xs font-bold" style={{ color: "var(--sama-terra)" }}>
          {user ? getInitials(user.nom) : "?"}
        </span>
      </button>
    </header>
  );
}
