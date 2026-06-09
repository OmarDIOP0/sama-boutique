import api from "./axios";
import type { ApiResponse, PushPreferences, PushSubscribeRequest } from "@/types";

export const pushApi = {
  getVapidKey: () =>
    api.get<ApiResponse<{ publicKey: string }>>("/api/notifications/vapid-public-key"),
  subscribe: (data: PushSubscribeRequest) =>
    api.post<ApiResponse<null>>("/api/notifications/subscribe", data),
  unsubscribe: (endpoint?: string) =>
    api.post<ApiResponse<null>>("/api/notifications/unsubscribe", { endpoint }),
  getPreferences: () =>
    api.get<ApiResponse<PushPreferences>>("/api/notifications/preferences"),
  updatePreferences: (data: Omit<PushPreferences, "subscribed">) =>
    api.put<ApiResponse<null>>("/api/notifications/preferences", data),
  sendTest: () =>
    api.post<ApiResponse<null>>("/api/notifications/test", {}),
};
