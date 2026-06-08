import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface Props {
    open: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    width?: number;
}

export function AdminDrawer({ open, onClose, title, subtitle, children, footer, width = 440 }: Props) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 transition-opacity duration-300"
                style={{
                    background: "rgba(81,49,2,0.35)",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? "auto" : "none",
                }}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                className="admin-drawer fixed inset-y-0 right-0 z-50 flex flex-col"
                style={{
                    width: `min(${width}px, 100vw)`,
                    background: "#FFF8EE",
                    boxShadow: "-16px 0 48px rgba(81,49,2,0.18)",
                    transform: open ? "translateX(0)" : "translateX(100%)",
                    transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1)",
                }}
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                    style={{ borderBottom: "1px solid rgba(81,49,2,0.08)", background: "rgba(255,255,255,0.6)" }}>
                    <div>
                        {title && (
                            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#513102", fontFamily: "'Playfair Display', Georgia, serif" }}>
                                {title}
                            </h3>
                        )}
                        {subtitle && <p style={{ fontSize: 12.5, color: "rgba(81,49,2,0.50)", marginTop: 1 }}>{subtitle}</p>}
                    </div>
                    <button onClick={onClose} aria-label="Fermer"
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
                        style={{ background: "rgba(81,49,2,0.06)", color: "rgba(81,49,2,0.55)", cursor: "pointer" }}>
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 flex-shrink-0" style={{ borderTop: "1px solid rgba(81,49,2,0.08)" }}>
                        {footer}
                    </div>
                )}
            </div>
        </>,
        document.body
    );
}
