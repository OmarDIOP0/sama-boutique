import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/api/analytics.api";

export const ANALYTICS_KEY = "analytics";

export function useKPIs() {
  return useQuery({
    queryKey: [ANALYTICS_KEY, "kpis"],
    queryFn: async () => {
      const res = await analyticsApi.getKPIs();
      return res.data.data;
    },
    refetchInterval: 60 * 1000,
    staleTime: 30 * 1000,
  });
}

export function useTopProducts(params?: { top?: number; from?: string; to?: string }) {
  return useQuery({
    queryKey: [ANALYTICS_KEY, "top-products", params],
    queryFn: async () => {
      const res = await analyticsApi.getTopProducts(params);
      return res.data.data;
    },
  });
}

export function useTopClients(params?: { top?: number }) {
  return useQuery({
    queryKey: [ANALYTICS_KEY, "top-clients", params],
    queryFn: async () => {
      const res = await analyticsApi.getTopClients(params);
      return res.data.data;
    },
  });
}

export function useSalesChart(params?: { periode?: "daily" | "monthly" }) {
  return useQuery({
    queryKey: [ANALYTICS_KEY, "sales-chart", params],
    queryFn: async () => {
      const res = await analyticsApi.getSalesChart(params);
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePaymentBreakdown(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: [ANALYTICS_KEY, "payment-breakdown", params],
    queryFn: async () => {
      const res = await analyticsApi.getPaymentBreakdown(params);
      return res.data.data;
    },
  });
}
