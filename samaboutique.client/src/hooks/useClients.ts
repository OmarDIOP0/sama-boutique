import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientsApi } from "@/api/clients.api";
import type { ClientCreateRequest, ClientUpdateRequest, ClientsFilters } from "@/types";

export const CLIENTS_KEY = "clients";

export function useClients(filters: ClientsFilters = {}) {
  return useQuery({
    queryKey: [CLIENTS_KEY, filters],
    queryFn: async () => {
      const res = await clientsApi.getAll(filters);
      return res.data;
    },
    refetchInterval: 30000,  // temps réel
  });
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: [CLIENTS_KEY, id],
    queryFn: async () => {
      const res = await clientsApi.getById(id!);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ClientCreateRequest) => {
      const res = await clientsApi.create(data);
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [CLIENTS_KEY] }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: ClientUpdateRequest & { id: string }) =>
      clientsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CLIENTS_KEY] }),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CLIENTS_KEY] }),
  });
}
