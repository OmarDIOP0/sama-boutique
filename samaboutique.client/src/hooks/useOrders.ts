import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/api/orders.api";
import type { OrderCreateRequest, OrdersFilters } from "@/types";

export const ORDERS_KEY = "orders";

export function useOrders(filters: OrdersFilters = {}) {
  return useQuery({
    queryKey: [ORDERS_KEY, filters],
    queryFn: async () => {
      const res = await ordersApi.getAll(filters);
      return res.data;
    },
  });
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: [ORDERS_KEY, id],
    queryFn: async () => {
      const res = await ordersApi.getById(id!);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: OrderCreateRequest) => {
      const res = await ordersApi.create(data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [ORDERS_KEY] }),
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, statut }: { id: string; statut: string }) =>
      ordersApi.updateStatus(id, statut),
    onSuccess: () => qc.invalidateQueries({ queryKey: [ORDERS_KEY] }),
  });
}
