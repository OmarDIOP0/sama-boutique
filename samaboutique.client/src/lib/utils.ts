import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = "XOF"): string {
  if (currency === "XOF") {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date, pattern = "dd/MM/yyyy"): string {
  try {
    return format(new Date(date), pattern, { locale: fr });
  } catch {
    return "—";
  }
}

export function formatDateRelative(date: string | Date): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
  } catch {
    return "—";
  }
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, "dd/MM/yyyy HH:mm");
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

export function formatPercent(n: number, decimals = 1): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(decimals)}%`;
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function roleLabel(role: string): string {
  const map: Record<string, string> = {
    SuperAdmin: "Super Admin",
    Admin: "Administrateur",
    Caissier: "Caissier",
    Vendeur: "Vendeur",
    Client: "Client",
  };
  return map[role] ?? role;
}

export function statusColor(statut: string): string {
  const map: Record<string, string> = {
    Actif: "bg-success/10 text-success",
    Inactif: "bg-muted text-muted-foreground",
    Archive: "bg-warning/10 text-warning",
    Completee: "bg-success/10 text-success",
    Annulee: "bg-danger/10 text-danger",
    Remboursee: "bg-warning/10 text-warning",
    EnAttente: "bg-warning/10 text-warning",
    Confirmee: "bg-primary/10 text-primary",
    EnPreparation: "bg-accent/10 text-accent",
    Expediee: "bg-primary/20 text-primary",
    Livree: "bg-success/10 text-success",
    Retournee: "bg-danger/10 text-danger",
    Nouveau: "bg-accent/10 text-accent",
    Regulier: "bg-primary/10 text-primary",
    VIP: "bg-warning/10 text-warning",
    Inactif2: "bg-muted text-muted-foreground",
  };
  return map[statut] ?? "bg-muted text-muted-foreground";
}
