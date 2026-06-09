import "@fontsource/playfair-display/400.css";
import "@fontsource/playfair-display/700.css";
import "@fontsource/playfair-display/400-italic.css";
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/500.css";
import "@fontsource/instrument-sans/600.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { router } from "./router";
import { initTheme } from "./hooks/useTheme";
import { PwaChrome } from "./components/pwa/PwaChrome";
import "./index.css";

// Applique le thème (clair/sombre) avant le rendu pour éviter le flash
initTheme();

// En développement : purge tout service worker / cache résiduel qui pourrait
// servir un shell obsolète (page blanche). Le SW n'est utilisé qu'en production.
if (import.meta.env.DEV && typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch(() => { /* ignore */ });
  if (typeof caches !== "undefined") {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => { /* ignore */ });
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Données considérées "fraîches" 5s → refetch rapide après ce délai
      staleTime: 5 * 1000,
      // Temps réel : rafraîchit quand l'onglet reprend le focus ou que le réseau revient
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      retry: (failureCount, error) => {
        const msg = (error as Error)?.message ?? "";
        if (msg.includes("401") || msg.includes("403") || msg.includes("404")) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <PwaChrome />
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { fontFamily: "Instrument Sans, sans-serif", fontSize: 14 },
        }}
      />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>
);
