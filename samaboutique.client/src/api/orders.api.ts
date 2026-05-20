import api from "./axios";
import type {
  ApiResponse,
  PaginatedResponse,
  Order,
  OrderCreateRequest,
  OrdersFilters,
} from "@/types";

export const ordersApi = {
  getAll: (filters: OrdersFilters = {}) =>
    api.get<PaginatedResponse<Order>>("/api/orders", { params: filters }),

  getById: (id: string) =>
    api.get<ApiResponse<Order>>(`/api/orders/${id}`),

  create: (data: OrderCreateRequest) =>
    api.post<ApiResponse<Order>>("/api/orders", data),

  updateStatus: (id: string, statut: string) =>
    api.patch<ApiResponse<Order>>(`/api/orders/${id}/status`, { statut }),
};
