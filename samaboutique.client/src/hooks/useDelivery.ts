import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deliveryApi } from "@/api/delivery.api";
import type { DeliveryZoneRequest } from "@/types";

export const DELIVERY_KEY = "delivery-zones";

export function useDeliveryZones(activeOnly = false) {
  return useQuery({
    queryKey: [DELIVERY_KEY, activeOnly],
    queryFn: async () => {
      const res = await deliveryApi.getAll(activeOnly);
      return res.data.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateDeliveryZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: DeliveryZoneRequest) => deliveryApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DELIVERY_KEY] }),
  });
}

export function useUpdateDeliveryZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DeliveryZoneRequest }) => deliveryApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DELIVERY_KEY] }),
  });
}

export function useDeleteDeliveryZone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deliveryApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DELIVERY_KEY] }),
  });
}
