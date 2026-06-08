import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { useUIStore } from "@/stores/ui.store";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { getOfflineQueue } from "@/lib/offline-queue";

export function AdminLayout() {
  const { sidebarOpen, setOnlineStatus, setOfflineQueueCount } = useUIStore();

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true);
      syncOfflineQueue();
    };
    const handleOffline = () => setOnlineStatus(false);

    setOnlineStatus(navigator.onLine);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load offline queue count on mount
  useEffect(() => {
    getOfflineQueue().then((q) => setOfflineQueueCount(q.length));
  }, []);

  async function syncOfflineQueue() {
    const queue = await getOfflineQueue();
    setOfflineQueueCount(queue.length);
    // Sync logic handled in POS page
  }

  return (
    <div className="admin-scope min-h-screen flex">
      <AdminSidebar />

      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          sidebarOpen ? "lg:ml-64" : "lg:ml-16"
        )}
      >
        <AdminTopbar />
        <main className="flex-1 overflow-auto admin-bg">
          <ErrorBoundary>
            <div className="page-enter">
              <Outlet />
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
