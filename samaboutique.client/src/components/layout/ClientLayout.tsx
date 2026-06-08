import { Outlet } from "react-router-dom";
import { ClientNavbar } from "./ClientNavbar";
import { ClientFooter } from "./ClientFooter";
import { BottomNav } from "./BottomNav";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export function ClientLayout() {
  return (
    <div className="client-scope min-h-screen flex flex-col wurus-bg">
      <ClientNavbar />
      <main className="flex-1 flex flex-col">
        <ErrorBoundary>
          {/* pb-16 = espace pour le BottomNav sur mobile */}
          <div className="page-enter flex-1 flex flex-col pb-16 lg:pb-0">
            <Outlet />
          </div>
        </ErrorBoundary>
      </main>
      <div className="hidden lg:block">
        <ClientFooter />
      </div>
      <BottomNav />
    </div>
  );
}
