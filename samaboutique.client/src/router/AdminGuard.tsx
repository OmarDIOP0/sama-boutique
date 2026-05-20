import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import type { UserRole } from "@/types";

interface AdminGuardProps {
  allowedRoles?: UserRole[];
}

export function AdminGuard({ allowedRoles }: AdminGuardProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  const adminRoles: UserRole[] = ["SuperAdmin", "Admin", "Caissier", "Vendeur"];
  if (!adminRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
