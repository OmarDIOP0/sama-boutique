import { AlertTriangle, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "default";
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirmer l'action",
  description = "Êtes-vous sûr de vouloir effectuer cette action ?",
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border/50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                variant === "danger" && "bg-danger/10",
                variant === "warning" && "bg-warning/10",
                variant === "default" && "bg-muted"
              )}
            >
              <AlertTriangle
                className={cn(
                  "w-5 h-5",
                  variant === "danger" && "text-danger",
                  variant === "warning" && "text-warning",
                  variant === "default" && "text-muted-foreground"
                )}
              />
            </div>
            <h3
              className="text-xl font-bold text-foreground"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 justify-end px-6 py-4 border-t border-border/50 bg-muted/20">
          <button
            onClick={onClose}
            className="px-5 h-11 rounded-xl border border-input text-sm font-medium hover:bg-muted transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "px-5 h-11 rounded-xl text-sm font-semibold text-white flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all btn-lift",
              variant === "danger" && "bg-danger",
              variant === "warning" && "bg-warning",
              variant === "default" && ""
            )}
            style={variant === "default" ? { background: "var(--sama-terra)" } : undefined}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "En cours…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
