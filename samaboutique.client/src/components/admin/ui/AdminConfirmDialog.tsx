import { AlertTriangle, Loader2 } from "lucide-react";
import { AdminModal } from "./AdminModal";

interface Props {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "default";
    loading?: boolean;
}

export function AdminConfirmDialog({
    open, onClose, onConfirm,
    title = "Confirmer l'action",
    description = "Êtes-vous sûr de vouloir continuer ?",
    confirmLabel = "Confirmer",
    cancelLabel = "Annuler",
    variant = "danger",
    loading = false,
}: Props) {
    return (
        <AdminModal
            open={open}
            onClose={onClose}
            maxWidth={440}
            icon={AlertTriangle}
            title={title}
            persistent={loading}
            footer={
                <>
                    <button onClick={onClose} className="admin-btn-outline" disabled={loading}>
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={variant === "danger" ? "admin-btn-danger" : "admin-btn-gold"}
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? "En cours…" : confirmLabel}
                    </button>
                </>
            }
        >
            <p style={{ fontSize: 14, color: "rgba(81,49,2,0.70)", lineHeight: 1.6 }}>
                {description}
            </p>
        </AdminModal>
    );
}
