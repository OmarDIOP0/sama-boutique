import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { salesApi } from "@/api/sales.api";
import { PRODUCTS_KEY, STOCK_ALERTS_KEY } from "./useProducts";
import type { SaleCreateRequest, SalesFilters } from "@/types";

export const SALES_KEY = "sales";

export function useSales(filters: SalesFilters = {}) {
  return useQuery({
    queryKey: [SALES_KEY, filters],
    queryFn: async () => {
      const res = await salesApi.getAll(filters);
      return res.data;
    },
  });
}

export function useSale(id: string | undefined) {
  return useQuery({
    queryKey: [SALES_KEY, id],
    queryFn: async () => {
      const res = await salesApi.getById(id!);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: SaleCreateRequest) => {
      const res = await salesApi.create(data);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SALES_KEY] });
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      qc.invalidateQueries({ queryKey: [STOCK_ALERTS_KEY] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useCancelSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salesApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [SALES_KEY] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
