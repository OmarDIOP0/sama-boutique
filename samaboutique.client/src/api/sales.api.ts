import api from "./axios";
import type {
  ApiResponse,
  PaginatedResponse,
  Sale,
  SaleCreateRequest,
  SalesFilters,
} from "@/types";

export const salesApi = {
  create: (data: SaleCreateRequest) =>
    api.post<ApiResponse<Sale>>("/api/sales", data),

  getAll: (filters: SalesFilters = {}) =>
    api.get<PaginatedResponse<Sale>>("/api/sales", { params: filters }),

  getById: (id: string) =>
    api.get<ApiResponse<Sale>>(`/api/sales/${id}`),

  cancel: (id: string) =>
    api.post<ApiResponse<Sale>>(`/api/sales/${id}/cancel`),
};
