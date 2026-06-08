import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info" | "payment";
  message: string;
  createdAt: string;
  read: boolean;
  amount?: number;       // montant du paiement (notifs de type payment)
  refId?: string;        // id de la vente/commande liée
}

interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  notifications: Notification[];
  isOnline: boolean;
  offlineQueueCount: number;
  lastSeenSaleId: string | null;   // suivi du dernier paiement notifié

  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
  addNotification: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
  setOnlineStatus: (online: boolean) => void;
  setOfflineQueueCount: (count: number) => void;
  setLastSeenSaleId: (id: string | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      theme: "light",
      notifications: [],
      isOnline: true,
      offlineQueueCount: 0,
      lastSeenSaleId: null,

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        set({ theme: next });
        document.documentElement.classList.toggle("dark", next === "dark");
      },

      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle("dark", theme === "dark");
      },

      addNotification: (n) => {
        const notification: Notification = {
          ...n,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          createdAt: new Date().toISOString(),
          read: false,
        };
        set((s) => ({
          notifications: [notification, ...s.notifications].slice(0, 50),
        }));
      },

      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      clearNotifications: () => set({ notifications: [] }),

      setOnlineStatus: (isOnline) => set({ isOnline }),
      setOfflineQueueCount: (count) => set({ offlineQueueCount: count }),
      setLastSeenSaleId: (id) => set({ lastSeenSaleId: id }),
    }),
    {
      name: "ui-store",
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        notifications: state.notifications.slice(0, 50),  // persister les paiements
        lastSeenSaleId: state.lastSeenSaleId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.classList.toggle("dark", state.theme === "dark");
        }
      },
    }
  )
);
