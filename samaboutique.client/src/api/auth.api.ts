import api from "./axios";
import type {
  ApiResponse,
  AuthTokens,
  User,
  LoginRequest,
  RegisterRequest,
  ChangePasswordRequest,
} from "@/types";

/** Shape of the login/register data payload returned by the backend */
interface LoginPayload extends AuthTokens {
  user: User;
}

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<ApiResponse<LoginPayload>>("/api/auth/login", data),

  register: (data: RegisterRequest) =>
    api.post<ApiResponse<LoginPayload>>("/api/auth/register", data),

  logout: () => api.post("/api/auth/logout"),

  refresh: (refreshToken: string) =>
    api.post<ApiResponse<AuthTokens>>("/api/auth/refresh", { refreshToken }),

  me: () => api.get<ApiResponse<User>>("/api/auth/me"),

  updateProfile: (data: { nom: string; telephone?: string; email?: string }) =>
    api.put<ApiResponse<User>>("/api/auth/me", data),

  changePassword: (data: ChangePasswordRequest) =>
    api.post("/api/auth/change-password", data),
};
