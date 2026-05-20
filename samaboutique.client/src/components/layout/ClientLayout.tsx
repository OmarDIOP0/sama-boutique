import { Outlet } from "react-router-dom";
import { ClientNavbar } from "./ClientNavbar";
import { ClientFooter } from "./ClientFooter";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

export function ClientLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ClientNavbar />
      <main className="flex-1 flex flex-col">
        <ErrorBoundary>
          <div className="page-enter flex-1 flex flex-col">
            <Outlet />
          </div>
        </ErrorBoundary>
      </main>
      <ClientFooter />
    </div>
  );
}
