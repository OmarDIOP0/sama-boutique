import api from "./axios";
import type {
  ApiResponse,
  PaginatedResponse,
  Client,
  ClientCreateRequest,
  ClientUpdateRequest,
  ClientsFilters,
} from "@/types";

export const clientsApi = {
  getAll: (filters: ClientsFilters = {}) =>
    api.get<PaginatedResponse<Client>>("/api/clients", { params: filters }),

  getById: (id: string) =>
    api.get<ApiResponse<Client>>(`/api/clients/${id}`),

  create: (data: ClientCreateRequest) =>
    api.post<ApiResponse<Client>>("/api/clients", data),

  update: (id: string, data: ClientUpdateRequest) =>
    api.put<ApiResponse<Client>>(`/api/clients/${id}`, data),

  delete: (id: string) =>
    api.delete(`/api/clients/${id}`),
};
