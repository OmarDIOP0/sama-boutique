import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { AdminIcon, type AdminIconColor } from "./AdminIcon";

interface AdminModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    icon?: React.ElementType;
    iconColor?: AdminIconColor;
    children: React.ReactNode;
    footer?: React.ReactNode;
    /** largeur max — défaut 560px */
    maxWidth?: number;
    /** empêche la fermeture par backdrop/Échap (formulaire en cours) */
    persistent?: boolean;
}

export function AdminModal({
    open, onClose, title, subtitle, icon: Icon, iconColor = "amber", children, footer,
    maxWidth = 560, persistent = false,
}: AdminModalProps) {
    // Fermeture via Échap
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !persistent) onClose();
        };
        document.addEventListener("keydown", onKey);
        // bloquer le scroll du body
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open, persistent, onClose]);

    if (!open) return null;

    return createPortal(
        <div
            className="admin-modal-backdrop"
            onClick={() => { if (!persistent) onClose(); }}
        >
            <div
                className="admin-modal-container"
                style={{ maxWidth }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                {(title || Icon) && (
                    <div className="flex items-center justify-between px-7 py-5 flex-shrink-0"
                        style={{ borderBottom: "1px solid rgba(81,49,2,0.08)" }}>
                        <div className="flex items-center gap-3">
                            {Icon && <AdminIcon icon={Icon} color={iconColor} size="sm" />}
                            <div>
                                {title && (
                                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#513102", fontFamily: "'Playfair Display', Georgia, serif" }}>
                                        {title}
                                    </h3>
                                )}
                                {subtitle && (
                                    <p style={{ fontSize: 13, color: "rgba(81,49,2,0.55)", marginTop: 1 }}>{subtitle}</p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            aria-label="Fermer"
                            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-[rgba(81,49,2,0.06)]"
                            style={{ color: "rgba(81,49,2,0.55)", cursor: "pointer" }}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Body (scrollable) */}
                <div className="px-7 py-6 overflow-y-auto flex-1">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 px-7 py-4 flex-shrink-0"
                        style={{ borderTop: "1px solid rgba(81,49,2,0.08)", background: "rgba(199,147,45,0.03)" }}>
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
