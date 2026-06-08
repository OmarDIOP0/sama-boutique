import { cn } from "@/lib/utils";

type Variant = "success" | "warning" | "danger" | "info" | "muted";

const VARIANT_CLASS: Record<Variant, string> = {
    success: "admin-badge-success",
    warning: "admin-badge-warning",
    danger: "admin-badge-danger",
    info: "admin-badge-info",
    muted: "admin-badge-muted",
};

// Mappe un statut métier (commande/vente) vers une variante visuelle
const STATUS_VARIANT: Record<string, Variant> = {
    // Commandes
    EnAttente: "warning",
    Confirmee: "info",
    EnPreparation: "info",
    Expediee: "info",
    Livree: "success",
    Annulee: "danger",
    Retournee: "danger",
    // Ventes
    "Complétée": "success",
    Completee: "success",
    "Annulée": "danger",
    "Remboursée": "muted",
    // Produits
    Actif: "success",
    Inactif: "muted",
    "Archivé": "muted",
};

const STATUS_LABEL: Record<string, string> = {
    EnAttente: "En attente",
    Confirmee: "Confirmée",
    EnPreparation: "En préparation",
    Expediee: "Expédiée",
    Livree: "Livrée",
    Annulee: "Annulée",
    Retournee: "Retournée",
};

export function AdminBadge({
    children, variant = "muted", dot = false, className,
}: {
    children: React.ReactNode; variant?: Variant; dot?: boolean; className?: string;
}) {
    return (
        <span className={cn("admin-badge", VARIANT_CLASS[variant], className)}>
            {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />}
            {children}
        </span>
    );
}

// Badge auto à partir d'un statut métier
export function AdminStatusBadge({ statut, dot = true }: { statut: string; dot?: boolean }) {
    const variant = STATUS_VARIANT[statut] ?? "muted";
    const label = STATUS_LABEL[statut] ?? statut;
    return <AdminBadge variant={variant} dot={dot}>{label}</AdminBadge>;
}
