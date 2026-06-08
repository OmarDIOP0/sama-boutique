import api from "./axios";
import type {
  ApiResponse,
  PaginatedResponse,
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductsFilters,
  StockAlert,
  Category,
  CategoryCreateRequest,
} from "@/types";

export const productsApi = {
  getAll: (filters: ProductsFilters = {}) =>
    api.get<PaginatedResponse<Product>>("/api/products", { params: filters }),

  getById: (id: string) =>
    api.get<ApiResponse<Product>>(`/api/products/${id}`),

  getByBarcode: (code: string) =>
    api.get<ApiResponse<Product>>(`/api/products/barcode/${code}`),

  create: (data: ProductCreateRequest) =>
    api.post<ApiResponse<Product>>("/api/products", data),

  update: (id: string, data: ProductUpdateRequest) =>
    api.put<ApiResponse<Product>>(`/api/products/${id}`, data),

  delete: (id: string) =>
    api.delete(`/api/products/${id}`),

  // Promotion groupée
  applyBulkPromo: (remisePct: number, categoryId?: string) =>
    api.post<ApiResponse<{ count: number }>>("/api/products/promo/bulk", { remisePct, categoryId: categoryId ?? null }),
  removeBulkPromo: (categoryId?: string) =>
    api.delete<ApiResponse<{ count: number }>>(`/api/products/promo/bulk${categoryId ? `?categoryId=${categoryId}` : ""}`),

  getStockAlerts: () =>
    api.get<ApiResponse<StockAlert[]>>("/api/products/alerts/stock"),

  getCategories: () =>
    api.get<ApiResponse<Category[]>>("/api/products/categories"),

  createCategory: (data: CategoryCreateRequest) =>
    api.post<ApiResponse<Category>>("/api/products/categories", data),

  updateCategory: (id: string, data: CategoryCreateRequest) =>
    api.put<ApiResponse<Category>>(`/api/products/categories/${id}`, data),

  deleteCategory: (id: string) =>
    api.delete(`/api/products/categories/${id}`),

  uploadPhoto: (id: string, file: File) => {
    const form = new FormData();
    form.append("photo", file);
    return api.post<ApiResponse<{ url: string }>>(`/api/products/${id}/photos`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deletePhoto: (id: string, photoUrl: string) =>
    api.delete(`/api/products/${id}/photos`, { params: { photoUrl } }),
};
