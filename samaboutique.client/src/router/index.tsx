import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AdminGuard } from "./AdminGuard";
import { AuthGuard } from "./AuthGuard";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

// ── Auth pages ────────────────────────────────────────────────────────────────
const Login = lazy(() => import("@/pages/auth/Login"));
const Register = lazy(() => import("@/pages/auth/Register"));
const AuthCallback = lazy(() => import("@/pages/auth/AuthCallback"));

// ── Admin pages ───────────────────────────────────────────────────────────────
const Dashboard = lazy(() => import("@/pages/admin/Dashboard"));
const Products = lazy(() => import("@/pages/admin/Products"));
const ProductNew = lazy(() => import("@/pages/admin/ProductNew"));
const ProductEdit = lazy(() => import("@/pages/admin/ProductEdit"));
const Stock = lazy(() => import("@/pages/admin/Stock"));
const POS = lazy(() => import("@/pages/admin/POS"));
const Sales = lazy(() => import("@/pages/admin/Sales"));
const Clients = lazy(() => import("@/pages/admin/Clients"));
const ClientDetail = lazy(() => import("@/pages/admin/ClientDetail"));
const Orders = lazy(() => import("@/pages/admin/Orders"));
const Analytics = lazy(() => import("@/pages/admin/Analytics"));
const Categories = lazy(() => import("@/pages/admin/Categories"));
const Settings = lazy(() => import("@/pages/admin/Settings"));

// ── Client pages ──────────────────────────────────────────────────────────────
const Home = lazy(() => import("@/pages/client/Home"));
const Catalogue = lazy(() => import("@/pages/client/Catalogue"));
const ProductDetail = lazy(() => import("@/pages/client/ProductDetail"));
const Cart = lazy(() => import("@/pages/client/Cart"));
const Checkout = lazy(() => import("@/pages/client/Checkout"));
const OrderConfirm = lazy(() => import("@/pages/client/OrderConfirm"));
const OrderTracking = lazy(() => import("@/pages/client/OrderTracking"));
const Account = lazy(() => import("@/pages/client/Account"));
const Favorites = lazy(() => import("@/pages/client/Favorites"));

function PageSuspense({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSkeleton variant="page" />}>{children}</Suspense>
  );
}

export const router = createBrowserRouter([
  // ── Auth (admin) ─────────────────────────────────────────────────────────
  {
    path: "/admin/login",
    element: <PageSuspense><Login /></PageSuspense>,
  },

  // ── Admin section ─────────────────────────────────────────────────────────
  {
    path: "/admin",
    element: <AdminGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <PageSuspense><Dashboard /></PageSuspense> },
          { path: "products", element: <PageSuspense><Products /></PageSuspense> },
          { path: "products/new", element: <PageSuspense><ProductNew /></PageSuspense> },
          { path: "products/:id/edit", element: <PageSuspense><ProductEdit /></PageSuspense> },
          { path: "categories", element: <PageSuspense><Categories /></PageSuspense> },
          { path: "stock", element: <PageSuspense><Stock /></PageSuspense> },
          { path: "pos", element: <PageSuspense><POS /></PageSuspense> },
          { path: "sales", element: <PageSuspense><Sales /></PageSuspense> },
          { path: "clients", element: <PageSuspense><Clients /></PageSuspense> },
          { path: "clients/:id", element: <PageSuspense><ClientDetail /></PageSuspense> },
          { path: "orders", element: <PageSuspense><Orders /></PageSuspense> },
          { path: "analytics", element: <PageSuspense><Analytics /></PageSuspense> },
          { path: "settings", element: <PageSuspense><Settings /></PageSuspense> },
        ],
      },
    ],
  },

  // ── Client auth ───────────────────────────────────────────────────────────
  {
    path: "/login",
    element: <PageSuspense><Login isClient /></PageSuspense>,
  },
  {
    path: "/register",
    element: <PageSuspense><Register /></PageSuspense>,
  },
  {
    path: "/auth/callback",
    element: <PageSuspense><AuthCallback /></PageSuspense>,
  },

  // ── Client section ────────────────────────────────────────────────────────
  {
    path: "/",
    element: <ClientLayout />,
    children: [
      { index: true, element: <PageSuspense><Home /></PageSuspense> },
      { path: "catalogue", element: <PageSuspense><Catalogue /></PageSuspense> },
      { path: "produit/:id", element: <PageSuspense><ProductDetail /></PageSuspense> },
      { path: "panier", element: <PageSuspense><Cart /></PageSuspense> },
      {
        element: <AuthGuard />,
        children: [
          { path: "checkout", element: <PageSuspense><Checkout /></PageSuspense> },
          { path: "commande/confirmation", element: <PageSuspense><OrderConfirm /></PageSuspense> },
          { path: "commande/suivi/:id", element: <PageSuspense><OrderTracking /></PageSuspense> },
          { path: "compte", element: <PageSuspense><Account /></PageSuspense> },
          { path: "favoris", element: <PageSuspense><Favorites /></PageSuspense> },
        ],
      },
    ],
  },

  // Fallback
  { path: "*", element: <Navigate to="/" replace /> },
]);
