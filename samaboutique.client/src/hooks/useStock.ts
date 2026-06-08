import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { stockApi } from "@/api/stock.api";
import { PRODUCTS_KEY, STOCK_ALERTS_KEY } from "./useProducts";
import type { StockMovementRequest, StockMovementsFilters } from "@/types";

export const STOCK_MOVEMENTS_KEY = "stock-movements";

export function useStockMovements(filters: StockMovementsFilters = {}) {
  return useQuery({
    queryKey: [STOCK_MOVEMENTS_KEY, filters],
    queryFn: async () => {
      const res = await stockApi.getMovements(filters);
      return res.data;
    },
    refetchInterval: 30000,  // temps réel
  });
}

export function useAddStockMovement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: StockMovementRequest) => stockApi.addMovement(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [STOCK_MOVEMENTS_KEY] });
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      qc.invalidateQueries({ queryKey: [STOCK_ALERTS_KEY] });
    },
  });
}
