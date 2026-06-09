import { Banknote, ShoppingBag, AlertTriangle, Bell, CheckCircle2, XCircle, Info } from "lucide-react";
import type { NotificationType } from "@/stores/ui.store";

export interface NotifVisual {
  Icon: typeof Bell;
  color: string;   // couleur d'accent (icône + point)
  bg: string;      // fond de la pastille
  label: string;   // libellé du type (filtres)
}

export const NOTIF_VISUALS: Record<NotificationType, NotifVisual> = {
  payment: { Icon: Banknote, color: "#2D7A4F", bg: "rgba(45,122,79,0.12)", label: "Paiement" },
  order: { Icon: ShoppingBag, color: "#2563EB", bg: "rgba(37,99,235,0.12)", label: "Commande" },
  stock: { Icon: AlertTriangle, color: "#DC2626", bg: "rgba(239,68,68,0.10)", label: "Stock" },
  success: { Icon: CheckCircle2, color: "#2D7A4F", bg: "rgba(45,122,79,0.12)", label: "Succès" },
  error: { Icon: XCircle, color: "#DC2626", bg: "rgba(239,68,68,0.10)", label: "Erreur" },
  warning: { Icon: AlertTriangle, color: "#C7932D", bg: "rgba(199,147,45,0.12)", label: "Alerte" },
  info: { Icon: Info, color: "#C7932D", bg: "rgba(199,147,45,0.10)", label: "Info" },
};

export function notifVisual(type: NotificationType): NotifVisual {
  return NOTIF_VISUALS[type] ?? NOTIF_VISUALS.info;
}

// Temps relatif court (il y a 5 min, 2 h, etc.)
export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  return `il y a ${d} j`;
}

// Regroupe par jour : Aujourd'hui / Hier / date longue
export function dayGroupLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfTarget = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((startOfToday - startOfTarget) / 86400000);
  if (dayDiff <= 0) return "Aujourd'hui";
  if (dayDiff === 1) return "Hier";
  if (dayDiff < 7) return "Cette semaine";
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}
