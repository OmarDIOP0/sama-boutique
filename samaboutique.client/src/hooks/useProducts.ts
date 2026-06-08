import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productsApi } from "@/api/products.api";
import type {
  ProductsFilters,
  ProductCreateRequest,
  ProductUpdateRequest,
  CategoryCreateRequest,
} from "@/types";

export const PRODUCTS_KEY = "products";
export const CATEGORIES_KEY = "categories";
export const STOCK_ALERTS_KEY = "stock-alerts";

export function useProducts(filters: ProductsFilters = {}) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, filters],
    queryFn: async () => {
      const res = await productsApi.getAll(filters);
      return res.data;
    },
    staleTime: 5 * 1000,
    refetchInterval: 30000,  // temps réel : stock / promo / nouveaux produits
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, id],
    queryFn: async () => {
      const res = await productsApi.getById(id!);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useProductByBarcode(code: string) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, "barcode", code],
    queryFn: async () => {
      const res = await productsApi.getByBarcode(code);
      return res.data.data;
    },
    enabled: !!code,
    retry: false,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: [CATEGORIES_KEY],
    queryFn: async () => {
      const res = await productsApi.getCategories();
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      const msg = (error as Error)?.message ?? "";
      if (msg.includes("401") || msg.includes("403")) return false;
      return failureCount < 2;
    },
  });
}

export function useStockAlerts() {
  return useQuery({
    queryKey: [STOCK_ALERTS_KEY],
    queryFn: async () => {
      const res = await productsApi.getStockAlerts();
      return res.data.data;
    },
    refetchInterval: 5 * 60 * 1000,
  });
}

export function useApplyBulkPromo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ remisePct, categoryId }: { remisePct: number; categoryId?: string }) =>
      productsApi.applyBulkPromo(remisePct, categoryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
}

export function useRemoveBulkPromo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (categoryId?: string) => productsApi.removeBulkPromo(categoryId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductCreateRequest) => productsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: ProductUpdateRequest & { id: string }) =>
      productsApi.update(id, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY, vars.id] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryCreateRequest) =>
      productsApi.createCategory(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CATEGORIES_KEY] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: CategoryCreateRequest & { id: string }) =>
      productsApi.updateCategory(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CATEGORIES_KEY] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CATEGORIES_KEY] }),
  });
}

export function useUploadProductPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      productsApi.uploadPhoto(id, file),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY, vars.id] });
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
  });
}

export function useDeleteProductPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, photoUrl }: { id: string; photoUrl: string }) =>
      productsApi.deletePhoto(id, photoUrl),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY, vars.id] });
      qc.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
    },
  });
}
