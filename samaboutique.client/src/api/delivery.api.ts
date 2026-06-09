import api from "./axios";
import type { ApiResponse, DeliveryZone, DeliveryZoneRequest } from "@/types";

export const deliveryApi = {
  getAll: (activeOnly = false) =>
    api.get<ApiResponse<DeliveryZone[]>>(`/api/delivery${activeOnly ? "?activeOnly=true" : ""}`),
  create: (data: DeliveryZoneRequest) =>
    api.post<ApiResponse<DeliveryZone>>("/api/delivery", data),
  update: (id: string, data: DeliveryZoneRequest) =>
    api.put<ApiResponse<DeliveryZone>>(`/api/delivery/${id}`, data),
  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/api/delivery/${id}`),
};
