import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { salesApi } from "@/api/sales.api";
import { ordersApi } from "@/api/orders.api";
import { useStockAlerts } from "@/hooks/useProducts";
import { useUIStore } from "@/stores/ui.store";
import { formatPrice } from "@/lib/utils";
import type { Sale, Order } from "@/types";

/**
 * Centre de notifications admin — surveille en quasi temps réel :
 *   • les paiements reçus (ventes)
 *   • les nouvelles commandes en ligne
 *   • les alertes de stock (bas / rupture)
 * Pousse dans la cloche (persistée) + toast pour les évènements importants.
 * À monter une seule fois (AdminLayout).
 */
export function useAdminNotifications(enabled: boolean) {
  usePaymentSignals(enabled);
  useOrderSignals(enabled);
  useStockSignals(enabled);
}

// ── Paiements ────────────────────────────────────────────────────────────────
function usePaymentSignals(enabled: boolean) {
  const addNotification = useUIStore((s) => s.addNotification);
  const lastSeenSaleId = useUIStore((s) => s.lastSeenSaleId);
  const setLastSeenSaleId = useUIStore((s) => s.setLastSeenSaleId);
  const initRef = useRef(false);

  const { data } = useQuery({
    queryKey: ["notif-sales"],
    queryFn: async () => (await salesApi.getAll({ page: 1, pageSize: 10 })).data,
    refetchInterval: 15000,
    refetchIntervalInBackground: true,
    enabled,
    staleTime: 0,
  });

  useEffect(() => {
    const sales: Sale[] = data?.data ?? [];
    if (sales.length === 0) return;

    if (!initRef.current && lastSeenSaleId === null) {
      initRef.current = true;
      setLastSeenSaleId(sales[0].id);
      return;
    }
    initRef.current = true;

    const lastIdx = sales.findIndex((s) => s.id === lastSeenSaleId);
    const newSales = lastIdx === -1 ? sales : sales.slice(0, lastIdx);
    if (newSales.length === 0) return;

    [...newSales].reverse().forEach((sale) => {
      addNotification({
        type: "payment",
        title: "Paiement reçu",
        message: `${formatPrice(sale.totalTTC)}${sale.clientNom ? ` · ${sale.clientNom}` : ""}`,
        amount: sale.totalTTC,
        refId: sale.id,
        link: "/admin/sales",
      });
    });
    const latest = newSales[0];
    toast.success(`💰 Paiement reçu : ${formatPrice(latest.totalTTC)}`, {
      description: latest.clientNom ?? "Vente en ligne",
      duration: 5000,
    });
    setLastSeenSaleId(sales[0].id);
  }, [data, lastSeenSaleId, addNotification, setLastSeenSaleId]);
}

// ── Commandes en ligne ───────────────────────────────────────────────────────
function useOrderSignals(enabled: boolean) {
  const addNotification = useUIStore((s) => s.addNotification);
  const lastSeenOrderId = useUIStore((s) => s.lastSeenOrderId);
  const setLastSeenOrderId = useUIStore((s) => s.setLastSeenOrderId);
  const initRef = useRef(false);

  const { data } = useQuery({
    queryKey: ["notif-orders"],
    queryFn: async () => (await ordersApi.getAll({ page: 1, pageSize: 10 })).data,
    refetchInterval: 20000,
    refetchIntervalInBackground: true,
    enabled,
    staleTime: 0,
  });

  useEffect(() => {
    const orders: Order[] = data?.data ?? [];
    if (orders.length === 0) return;

    if (!initRef.current && lastSeenOrderId === null) {
      initRef.current = true;
      setLastSeenOrderId(orders[0].id);
      return;
    }
    initRef.current = true;

    const lastIdx = orders.findIndex((o) => o.id === lastSeenOrderId);
    const newOrders = lastIdx === -1 ? orders : orders.slice(0, lastIdx);
    if (newOrders.length === 0) return;

    [...newOrders].reverse().forEach((order) => {
      addNotification({
        type: "order",
        title: "Nouvelle commande",
        message: `${order.clientNom} · ${formatPrice(order.totalTTC)}`,
        amount: order.totalTTC,
        refId: order.id,
        link: "/admin/orders",
      });
    });
    const latest = newOrders[0];
    toast(`🛍️ Nouvelle commande — ${latest.clientNom}`, {
      description: formatPrice(latest.totalTTC),
      duration: 5000,
    });
    setLastSeenOrderId(orders[0].id);
  }, [data, lastSeenOrderId, addNotification, setLastSeenOrderId]);
}

// ── Alertes de stock ─────────────────────────────────────────────────────────
function useStockSignals(enabled: boolean) {
  const addNotification = useUIStore((s) => s.addNotification);
  const { data: alerts = [] } = useStockAlerts();
  // variantIds déjà notifiés dans cette session (évite le spam)
  const seenRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    // Premier passage : on mémorise l'état initial sans notifier
    if (seenRef.current === null) {
      seenRef.current = new Set(alerts.map((a) => a.variantId));
      return;
    }
    const seen = seenRef.current;
    const fresh = alerts.filter((a) => !seen.has(a.variantId));
    fresh.forEach((a) => {
      seen.add(a.variantId);
      const rupture = a.stockActuel === 0;
      addNotification({
        type: "stock",
        title: rupture ? "Rupture de stock" : "Stock bas",
        message: `${a.productNom}${a.variante ? ` (${a.variante})` : ""} — ${a.stockActuel} en stock`,
        refId: a.variantId,
        link: "/admin/stock",
      });
    });
    if (fresh.length > 0) {
      toast.warning(`⚠️ ${fresh.length} alerte${fresh.length > 1 ? "s" : ""} de stock`, {
        description: fresh[0].productNom,
        duration: 5000,
      });
    }
  }, [alerts, enabled, addNotification]);
}
