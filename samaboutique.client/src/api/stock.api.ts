import api from "./axios";
import type {
  ApiResponse,
  PaginatedResponse,
  StockMovement,
  StockMovementRequest,
  StockMovementsFilters,
} from "@/types";

export const stockApi = {
  addMovement: (data: StockMovementRequest) =>
    api.post<ApiResponse<StockMovement>>("/api/stock/movement", data),

  getMovements: (filters: StockMovementsFilters = {}) =>
    api.get<PaginatedResponse<StockMovement>>("/api/stock/movements", { params: filters }),
};
