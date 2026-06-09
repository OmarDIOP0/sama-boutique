import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Trash2, Check, X } from "lucide-react";
import { useUIStore } from "@/stores/ui.store";
import type { Notification, NotificationType } from "@/stores/ui.store";
import { AdminPageHeader, AdminEmptyState } from "@/components/admin/ui";
import { notifVisual, relativeTime, dayGroupLabel } from "@/lib/notifications";
import { formatPrice } from "@/lib/utils";

const GOLD = "#C7932D";
const DARK = "#513102";

type FilterKey = "all" | "unread" | NotificationType;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tout" },
  { key: "unread", label: "Non lus" },
  { key: "payment", label: "Paiements" },
  { key: "order", label: "Commandes" },
  { key: "stock", label: "Stock" },
];

export default function Notifications() {
  const navigate = useNavigate();
  const notifications = useUIStore((s) => s.notifications);
  const markRead = useUIStore((s) => s.markRead);
  const markAllRead = useUIStore((s) => s.markAllRead);
  const removeNotification = useUIStore((s) => s.removeNotification);
  const clearNotifications = useUIStore((s) => s.clearNotifications);

  const [filter, setFilter] = useState<FilterKey>("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread") return notifications.filter((n) => !n.read);
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  // Regroupement par jour, dans l'ordre d'arrivée (déjà trié desc)
  const groups = useMemo(() => {
    const map = new Map<string, Notification[]>();
    for (const n of filtered) {
      const key = dayGroupLabel(n.createdAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(n);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const countFor = (key: FilterKey) => {
    if (key === "all") return notifications.length;
    if (key === "unread") return unreadCount;
    return notifications.filter((n) => n.type === key).length;
  };

  const handleClick = (n: Notification) => {
    if (!n.read) markRead(n.id);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-[1100px]">
      <AdminPageHeader
        icon={Bell}
        iconColor="amber"
        title="Notifications"
        subtitle={unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}` : "Tout est à jour"}
      >
        {notifications.length > 0 && (
          <>
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl transition-colors disabled:opacity-40"
              style={{ background: "rgba(199,147,45,0.12)", color: GOLD, fontSize: 13.5, fontWeight: 600, cursor: unreadCount === 0 ? "default" : "pointer" }}
            >
              <CheckCheck className="w-4 h-4" /> Tout marquer lu
            </button>
            <button
              onClick={clearNotifications}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl transition-colors"
              style={{ background: "rgba(239,68,68,0.10)", color: "#DC2626", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}
            >
              <Trash2 className="w-4 h-4" /> Tout effacer
            </button>
          </>
        )}
      </AdminPageHeader>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const c = countFor(f.key);
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="inline-flex items-center gap-2 h-9 px-3.5 rounded-full transition-all"
              style={{
                background: active ? DARK : "rgba(81,49,2,0.05)",
                color: active ? "#FFF8EE" : "rgba(81,49,2,0.65)",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              {f.label}
              <span className="inline-flex items-center justify-center rounded-full px-1.5"
                style={{
                  minWidth: 20, height: 18, fontSize: 11, fontWeight: 700,
                  background: active ? "rgba(255,248,238,0.20)" : "rgba(81,49,2,0.08)",
                  color: active ? "#FFF8EE" : "rgba(81,49,2,0.55)",
                }}>
                {c}
              </span>
            </button>
          );
        })}
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="admin-card">
          <AdminEmptyState
            icon={Bell}
            title={filter === "all" ? "Aucune notification" : "Rien à afficher"}
            description={filter === "all"
              ? "Les paiements, commandes et alertes de stock apparaîtront ici en temps réel."
              : "Aucune notification ne correspond à ce filtre."}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(([day, items]) => (
            <div key={day}>
              <p className="mb-2.5 px-1" style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "rgba(81,49,2,0.45)" }}>
                {day}
              </p>
              <div className="admin-card divide-y" style={{ borderColor: "rgba(81,49,2,0.06)" }}>
                {items.map((n) => {
                  const v = notifVisual(n.type);
                  return (
                    <div
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className="group flex items-start gap-3.5 px-4 py-3.5 transition-colors"
                      style={{ background: !n.read ? "rgba(199,147,45,0.05)" : "transparent", cursor: n.link ? "pointer" : "default" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(199,147,45,0.08)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = !n.read ? "rgba(199,147,45,0.05)" : "transparent"; }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: v.bg }}>
                        <v.Icon className="w-5 h-5" style={{ color: v.color }} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {n.title && <p style={{ fontSize: 14.5, fontWeight: 700, color: DARK }}>{n.title}</p>}
                          {n.type === "payment" && n.amount != null && (
                            <span style={{ fontSize: 13.5, fontWeight: 700, color: v.color }}>{formatPrice(n.amount)}</span>
                          )}
                        </div>
                        <p style={{ fontSize: 13.5, color: "rgba(81,49,2,0.65)", marginTop: 1 }}>{n.message}</p>
                        <p style={{ fontSize: 11.5, color: "rgba(81,49,2,0.40)", marginTop: 3 }}>{relativeTime(n.createdAt)}</p>
                      </div>

                      {/* Actions par item */}
                      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.read && (
                          <button
                            onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                            style={{ color: "rgba(81,49,2,0.55)" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(45,122,79,0.12)"; (e.currentTarget as HTMLElement).style.color = "#2D7A4F"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(81,49,2,0.55)"; }}
                            title="Marquer comme lu"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); removeNotification(n.id); }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                          style={{ color: "rgba(81,49,2,0.55)" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.10)"; (e.currentTarget as HTMLElement).style.color = "#DC2626"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(81,49,2,0.55)"; }}
                          title="Supprimer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {!n.read && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2 self-start" style={{ background: GOLD }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
