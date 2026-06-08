import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { salesApi } from "@/api/sales.api";
import { useUIStore } from "@/stores/ui.store";
import { formatPrice } from "@/lib/utils";
import type { Sale } from "@/types";

/**
 * Surveille les nouveaux paiements en quasi temps réel (polling) et :
 *  - pousse une notification dans la cloche admin (persistée)
 *  - affiche un toast à chaque nouveau paiement
 * À utiliser une seule fois, dans AdminLayout.
 */
export function usePaymentNotifications(enabled: boolean) {
    const addNotification = useUIStore((s) => s.addNotification);
    const lastSeenSaleId = useUIStore((s) => s.lastSeenSaleId);
    const setLastSeenSaleId = useUIStore((s) => s.setLastSeenSaleId);
    const initializedRef = useRef(false);

    // Poll les ventes récentes toutes les 15s
    const { data } = useQuery({
        queryKey: ["payment-notifications"],
        queryFn: async () => {
            const res = await salesApi.getAll({ page: 1, pageSize: 10 });
            return res.data;
        },
        refetchInterval: 15000,
        refetchIntervalInBackground: true,
        enabled,
        staleTime: 0,
    });

    useEffect(() => {
        const sales: Sale[] = data?.data ?? [];
        if (sales.length === 0) return;

        // Premier passage : on mémorise le dernier paiement SANS notifier
        // (évite de spammer l'historique au chargement)
        if (!initializedRef.current && lastSeenSaleId === null) {
            initializedRef.current = true;
            setLastSeenSaleId(sales[0].id);
            return;
        }
        initializedRef.current = true;

        // Trouver les ventes plus récentes que la dernière vue
        const lastIdx = sales.findIndex((s) => s.id === lastSeenSaleId);
        const newSales = lastIdx === -1 ? sales : sales.slice(0, lastIdx);

        if (newSales.length > 0) {
            // Notifier du plus ancien au plus récent
            [...newSales].reverse().forEach((sale) => {
                addNotification({
                    type: "payment",
                    message: `Paiement reçu — ${formatPrice(sale.totalTTC)}${sale.clientNom ? ` · ${sale.clientNom}` : ""}`,
                    amount: sale.totalTTC,
                    refId: sale.id,
                });
            });
            // Toast pour le plus récent
            const latest = newSales[0];
            toast.success(`💰 Paiement reçu : ${formatPrice(latest.totalTTC)}`, {
                description: latest.clientNom ?? "Vente en ligne",
                duration: 5000,
            });
            setLastSeenSaleId(sales[0].id);
        }
    }, [data, lastSeenSaleId, addNotification, setLastSeenSaleId]);
}
