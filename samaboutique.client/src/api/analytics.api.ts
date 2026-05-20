import api from "./axios";
import type {
  ApiResponse,
  KPIs,
  TopProduct,
  TopClient,
  SalesChartPoint,
  PaymentBreakdown,
} from "@/types";

export const analyticsApi = {
  getKPIs: () =>
    api.get<ApiResponse<KPIs>>("/api/analytics/kpis"),

  getTopProducts: (params?: { top?: number; from?: string; to?: string }) =>
    api.get<ApiResponse<TopProduct[]>>("/api/analytics/top-products", { params }),

  getTopClients: (params?: { top?: number }) =>
    api.get<ApiResponse<TopClient[]>>("/api/analytics/top-clients", { params }),

  getSalesChart: (params?: { periode?: "daily" | "monthly" }) =>
    api.get<ApiResponse<SalesChartPoint[]>>("/api/analytics/sales-chart", { params }),

  getPaymentBreakdown: (params?: { from?: string; to?: string }) =>
    api.get<ApiResponse<PaymentBreakdown[]>>("/api/analytics/payment-breakdown", { params }),
};
