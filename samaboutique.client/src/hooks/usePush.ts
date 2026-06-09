import { useCallback, useEffect, useState } from "react";
import { pushApi } from "@/api/push.api";
import type { PushPreferences } from "@/types";

// Convertit la clé VAPID (base64url) en Uint8Array pour applicationServerKey
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export const pushSupported =
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

type PermState = NotificationPermission | "unsupported";

export interface UsePush {
  supported: boolean;
  permission: PermState;
  subscribed: boolean;
  loading: boolean;
  prefs: Omit<PushPreferences, "subscribed">;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<void>;
  savePreferences: (p: Omit<PushPreferences, "subscribed">) => Promise<void>;
  sendTest: () => Promise<void>;
  refresh: () => Promise<void>;
}

const DEFAULT_PREFS = { notifyOrders: true, notifyPromotions: true, notifyStock: true };

export function usePush(): UsePush {
  const [permission, setPermission] = useState<PermState>(
    pushSupported ? Notification.permission : "unsupported"
  );
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);

  const refresh = useCallback(async () => {
    if (!pushSupported) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      const serverPrefs = (await pushApi.getPreferences()).data.data;
      setSubscribed(!!sub && serverPrefs.subscribed);
      setPrefs({
        notifyOrders: serverPrefs.notifyOrders,
        notifyPromotions: serverPrefs.notifyPromotions,
        notifyStock: serverPrefs.notifyStock,
      });
    } catch {
      /* non abonné ou SW indisponible */
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!pushSupported) return false;
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return false;

      const reg = await navigator.serviceWorker.ready;
      const vapidKey = (await pushApi.getVapidKey()).data.data.publicKey;

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      const json = sub.toJSON();
      await pushApi.subscribe({
        endpoint: sub.endpoint,
        keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
        userAgent: navigator.userAgent,
        ...prefs,
      });
      setSubscribed(true);
      return true;
    } catch (e) {
      console.error("Push subscribe error", e);
      return false;
    } finally {
      setLoading(false);
    }
  }, [prefs]);

  const unsubscribe = useCallback(async () => {
    if (!pushSupported) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      const endpoint = sub?.endpoint;
      if (sub) await sub.unsubscribe();
      await pushApi.unsubscribe(endpoint);
      setSubscribed(false);
    } catch (e) {
      console.error("Push unsubscribe error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const savePreferences = useCallback(async (p: Omit<PushPreferences, "subscribed">) => {
    setPrefs(p);
    await pushApi.updatePreferences(p);
  }, []);

  const sendTest = useCallback(async () => {
    await pushApi.sendTest();
  }, []);

  return {
    supported: pushSupported,
    permission,
    subscribed,
    loading,
    prefs,
    subscribe,
    unsubscribe,
    savePreferences,
    sendTest,
    refresh,
  };
}
