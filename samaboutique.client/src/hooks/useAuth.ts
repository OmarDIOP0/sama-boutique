import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import type { LoginRequest, RegisterRequest, ChangePasswordRequest } from "@/types";

export function useMe() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const res = await authApi.me();
      return res.data.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const res = await authApi.login(data);
      return res.data.data;
    },
    onSuccess: (data) => {
      setAuth(data.accessToken, data.refreshToken, data.user);
      const role = data.user.role;
      if (["SuperAdmin", "Admin", "Caissier", "Vendeur"].includes(role)) {
        navigate("/admin");
      } else {
        navigate("/");
      }
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const res = await authApi.register(data);
      return res.data.data;
    },
    onSuccess: (data) => {
      setAuth(data.accessToken, data.refreshToken, data.user);
      navigate("/");
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      logout();
      queryClient.clear();
      navigate("/admin/login");
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
  });
}

export function useUpdateProfile() {
  const { setUser, user } = useAuthStore();
  return useMutation({
    mutationFn: async (data: { nom: string; telephone?: string; email?: string }) => {
      const res = await authApi.updateProfile(data);
      return res.data.data;
    },
    onSuccess: (updated) => {
      // fusionne avec le user existant (garde token/role) et met à jour le store
      if (user) setUser({ ...user, ...updated });
    },
  });
}
