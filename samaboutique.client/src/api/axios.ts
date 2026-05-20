import axios, { type AxiosRequestConfig } from "axios";
// Imported lazily to avoid circular-dependency issues at module init time.
// useAuthStore.getState() is the recommended Zustand pattern for reading state
// outside of React components.
import { useAuthStore } from "@/stores/auth.store";

const BASE_URL = import.meta.env.VITE_API_URL ?? "";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// ── Token helpers — read/write directly from the Zustand store ────────────────

function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

function getRefreshToken(): string | null {
  return useAuthStore.getState().refreshToken;
}

function setTokens(accessToken: string, refreshToken: string) {
  useAuthStore.getState().setTokens(accessToken, refreshToken);
}

function clearAuth() {
  useAuthStore.getState().logout();
}

// ── Request interceptor — attach Bearer token ─────────────────────────────────

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — unwrap data + refresh on 401 ──────────────────────

let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];

function onTokenRefreshed(token: string) {
  pendingRequests.forEach((cb) => cb(token));
  pendingRequests = [];
}

api.interceptors.response.use(
  (response) => {
    // Unwrap unified API response → return data.data
    if (response.data && "success" in response.data) {
      if (!response.data.success) {
        return Promise.reject(new Error(response.data.message ?? "Erreur serveur"));
      }
      return { ...response, data: response.data };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        // Only redirect if the user was trying to access a protected route
        const isAdminRoute = window.location.pathname.startsWith("/admin");
        clearAuth();
        if (isAdminRoute) {
          window.location.href = "/admin/login";
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push((token) => {
            if (originalRequest.headers) {
              (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          });
          setTimeout(() => reject(error), 10000);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
        const tokens = data.data ?? data;
        setTokens(tokens.accessToken, tokens.refreshToken);
        onTokenRefreshed(tokens.accessToken);
        isRefreshing = false;
        if (originalRequest.headers) {
          (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${tokens.accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        pendingRequests = [];
        clearAuth();
        const isAdminRoute = window.location.pathname.startsWith("/admin");
        if (isAdminRoute) {
          window.location.href = "/admin/login";
        }
        return Promise.reject(refreshError);
      }
    }

    const message =
      error.response?.data?.message ??
      error.response?.data?.errors?.[0] ??
      error.message ??
      "Une erreur est survenue";
    return Promise.reject(new Error(message));
  }
);

export default api;
