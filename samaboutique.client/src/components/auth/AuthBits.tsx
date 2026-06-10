import { useRef } from "react";
import { Phone, Mail, Loader2, Truck, ShieldCheck, RotateCcw, Check } from "lucide-react";
import { detectContactKind, formatPhone } from "@/lib/contact";

export const GOLD = "#C7932D";
export const DARK = "#513102";
export const CREAM = "#FFF8EE";
export const BG_RIGHT = "#FDFAF7";
export const PANEL = "#1A0E06";
export const GREEN = "#2D7A4F";

/* ── Layout 2 colonnes ───────────────────────────────────────────────────── */
export function AuthShell({ quote, children }: { quote: string; children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            {/* Panneau gauche */}
            <div className="hidden lg:flex lg:w-[40%] relative flex-col justify-between p-12" style={{ background: PANEL }}>
                <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(199,147,45,0.18) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(199,147,45,0.20) 0%, transparent 70%)" }} />

                <div className="relative flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: GOLD, boxShadow: "0 3px 14px rgba(199,147,45,0.40)" }}>
                        <span style={{ fontStyle: "italic", fontWeight: 800, fontSize: 22, color: CREAM }}>S</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 21, color: CREAM }}>
                        Sama<span style={{ fontStyle: "italic", color: GOLD }}>Boutique</span>
                    </span>
                </div>

                <div className="relative space-y-7">
                    <div className="space-y-4">
                        <div className="w-10 h-0.5" style={{ background: "rgba(199,147,45,0.65)" }} />
                        <p key={quote} className="auth-in-right" style={{ fontSize: 28, lineHeight: 1.3, color: CREAM, fontStyle: "italic", fontWeight: 600, maxWidth: 380 }}>
                            « {quote} »
                        </p>
                    </div>
                    <div className="space-y-3">
                        {[
                            { Icon: Truck, t: "Livraison partout au Sénégal" },
                            { Icon: ShieldCheck, t: "Paiement Wave & Orange Money sécurisé" },
                            { Icon: RotateCcw, t: "Retours faciles sous 7 jours" },
                        ].map(({ Icon, t }) => (
                            <div key={t} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(199,147,45,0.14)" }}>
                                    <Icon className="w-4 h-4" style={{ color: GOLD }} />
                                </div>
                                <span style={{ fontSize: 13.5, color: "rgba(255,248,238,0.70)" }}>{t}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="relative text-xs" style={{ color: "rgba(255,248,238,0.30)" }}>
                    © {new Date().getFullYear()} SamaBoutique · Dakar, Sénégal 🇸🇳
                </p>
            </div>

            {/* Panneau droit */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10" style={{ background: BG_RIGHT }}>
                <div className="w-full max-w-[400px]">
                    <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: GOLD }}>
                            <span style={{ fontStyle: "italic", fontWeight: 800, fontSize: 18, color: CREAM }}>S</span>
                        </div>
                        <span className="font-bold text-xl" style={{ color: DARK }}>SamaBoutique</span>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}

/* ── Indicateur de progression ───────────────────────────────────────────── */
export function StepProgress({ step, labels }: { step: number; labels: string[] }) {
    return (
        <div className="flex items-start justify-between mb-9" style={{ maxWidth: 340, margin: "0 auto 36px" }}>
            {labels.map((label, i) => {
                const n = i + 1;
                const done = step > n;
                const active = step === n;
                return (
                    <div key={label} className="flex-1 flex flex-col items-center relative">
                        {i < labels.length - 1 && (
                            <div className="absolute" style={{ top: 17, left: "50%", right: "-50%", height: 3, borderRadius: 3, background: "rgba(81,49,2,0.08)" }}>
                                <div style={{ height: "100%", borderRadius: 3, background: GOLD, width: step > n ? "100%" : "0%", transition: "width .4s ease" }} />
                            </div>
                        )}
                        <div className="relative flex items-center justify-center rounded-full transition-all" style={{
                            width: 36, height: 36, zIndex: 1,
                            background: done ? GREEN : active ? GOLD : "rgba(81,49,2,0.08)",
                            color: done || active ? "white" : "rgba(81,49,2,0.35)",
                            fontSize: 15, fontWeight: 700,
                            boxShadow: active ? "0 4px 14px rgba(199,147,45,0.40)" : "none",
                        }}>
                            {done ? <Check className="w-4 h-4" /> : n}
                        </div>
                        <span style={{
                            marginTop: 8, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em",
                            fontWeight: active ? 700 : 500,
                            color: active ? DARK : done ? GREEN : "rgba(81,49,2,0.40)",
                        }}>{label}</span>
                    </div>
                );
            })}
        </div>
    );
}

/* ── Bouton Google ───────────────────────────────────────────────────────── */
export function GoogleButton({ label }: { label: string }) {
    return (
        <button type="button" onClick={() => { window.location.href = "https://localhost:7088/api/auth/google"; }}
            className="w-full flex items-center justify-center gap-3 rounded-xl font-medium transition-colors"
            style={{ height: 52, border: "1.5px solid rgba(81,49,2,0.12)", background: "white", color: DARK, fontSize: 14, cursor: "pointer", borderRadius: 14 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(81,49,2,0.03)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z" />
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z" />
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z" />
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.31z" />
            </svg>
            {label}
        </button>
    );
}

/* ── Séparateur "ou" ─────────────────────────────────────────────────────── */
export function OrSeparator() {
    return (
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: "rgba(81,49,2,0.08)" }} /></div>
            <div className="relative flex justify-center"><span className="px-3 text-xs" style={{ background: BG_RIGHT, color: "rgba(81,49,2,0.45)" }}>ou</span></div>
        </div>
    );
}

/* ── Bouton CTA ──────────────────────────────────────────────────────────── */
export function PrimaryBtn({ children, disabled, onClick, type = "button", loading, gradient }: {
    children: React.ReactNode; disabled?: boolean; onClick?: () => void;
    type?: "button" | "submit"; loading?: boolean; gradient?: boolean;
}) {
    return (
        <button type={type} onClick={onClick} disabled={disabled || loading}
            className="w-full flex items-center justify-center gap-2 font-bold disabled:opacity-50 transition-all"
            style={{
                height: gradient ? 56 : 52, borderRadius: 14, color: "white", fontSize: 15,
                background: gradient ? "linear-gradient(135deg, #C7932D, #b08024)" : GOLD,
                boxShadow: gradient ? "0 8px 24px rgba(199,147,45,0.35)" : "none",
                cursor: disabled || loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => { if (!disabled && !loading && !gradient) (e.currentTarget as HTMLElement).style.background = "#b08024"; }}
            onMouseLeave={(e) => { if (!gradient) (e.currentTarget as HTMLElement).style.background = GOLD; }}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
}

/* ── Champ contact intelligent (téléphone / email) ───────────────────────── */
export const inputBase: React.CSSProperties = {
    width: "100%", height: 52, borderRadius: 14, border: "1.5px solid rgba(81,49,2,0.12)",
    background: "rgba(255,255,255,0.8)", fontSize: 16, color: DARK, outline: "none",
    fontFamily: "'Bricolage Grotesque', sans-serif", transition: "border-color .2s, box-shadow .2s",
};
export function fieldFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = GOLD;
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(199,147,45,0.15)";
}
export function fieldBlur(e: React.FocusEvent<HTMLInputElement>, err?: boolean) {
    e.currentTarget.style.borderColor = err ? "#EF4444" : "rgba(81,49,2,0.12)";
    e.currentTarget.style.boxShadow = "none";
}

export function ContactField({ value, onChange, invalid, autoFocus }: {
    value: string; onChange: (v: string) => void; invalid?: boolean; autoFocus?: boolean;
}) {
    const kind = detectContactKind(value);
    const isPhone = kind === "phone" || kind === "empty";

    const handle = (raw: string) => {
        const k = detectContactKind(raw);
        onChange(k === "phone" ? formatPhone(raw) : raw);
    };

    return (
        <div className="relative flex items-center" style={{ ...inputBase, padding: 0, overflow: "hidden", borderColor: invalid ? "#EF4444" : "rgba(81,49,2,0.12)" }}
            onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = GOLD; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(199,147,45,0.15)"; }}
            onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = invalid ? "#EF4444" : "rgba(81,49,2,0.12)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}>
            {isPhone && (
                <div className="flex items-center gap-1.5 px-3 flex-shrink-0 self-stretch" style={{ background: "rgba(81,49,2,0.05)", borderRight: "1.5px solid rgba(81,49,2,0.10)", fontSize: 15, fontWeight: 600, color: DARK }}>
                    🇸🇳 +221
                </div>
            )}
            <input
                autoFocus={autoFocus}
                value={value}
                inputMode={isPhone ? "numeric" : "email"}
                onChange={(e) => handle(e.target.value)}
                placeholder={isPhone ? "77 000 00 00" : "vous@exemple.com"}
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "0 14px", fontSize: 16, color: DARK, fontFamily: "inherit" }}
            />
            {isPhone
                ? <Phone className="absolute right-3.5 w-4 h-4" style={{ color: GOLD }} />
                : <Mail className="absolute right-3.5 w-4 h-4" style={{ color: GOLD }} />}
        </div>
    );
}

/* ── Saisie OTP ──────────────────────────────────────────────────────────── */
export function OtpBoxes({ value, onChange, length, error, onComplete }: {
    value: string; onChange: (v: string) => void; length: number; error?: boolean; onComplete?: (v: string) => void;
}) {
    const refs = useRef<(HTMLInputElement | null)[]>([]);
    const chars = Array.from({ length }, (_, i) => value[i] ?? "");

    const commit = (next: string) => {
        const v = next.slice(0, length);
        onChange(v);
        if (v.length === length) onComplete?.(v);
    };
    const setAt = (i: number, c: string) => {
        const arr = chars.slice();
        arr[i] = c;
        commit(arr.join(""));
    };

    return (
        <div className={"flex items-center justify-center gap-2.5 " + (error ? "auth-shake" : "")}>
            {chars.map((c, i) => (
                <input
                    key={i}
                    ref={(el) => { refs.current[i] = el; }}
                    inputMode="numeric"
                    maxLength={1}
                    value={c}
                    onChange={(e) => {
                        const digit = e.target.value.replace(/\D/g, "").slice(-1);
                        setAt(i, digit);
                        if (digit && i < length - 1) refs.current[i + 1]?.focus();
                    }}
                    onKeyDown={(e) => { if (e.key === "Backspace" && !chars[i] && i > 0) refs.current[i - 1]?.focus(); }}
                    onPaste={(e) => {
                        e.preventDefault();
                        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
                        if (pasted) { commit(pasted); refs.current[Math.min(pasted.length, length - 1)]?.focus(); }
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(199,147,45,0.18)"; e.currentTarget.style.background = "rgba(199,147,45,0.03)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = error ? "#EF4444" : c ? "rgba(199,147,45,0.50)" : "rgba(81,49,2,0.12)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.background = c ? "rgba(199,147,45,0.05)" : "rgba(255,255,255,0.8)"; }}
                    style={{
                        width: length > 4 ? 50 : 64, height: 72, borderRadius: 14, textAlign: "center",
                        border: `2px solid ${error ? "#EF4444" : c ? "rgba(199,147,45,0.50)" : "rgba(81,49,2,0.12)"}`,
                        background: c ? "rgba(199,147,45,0.05)" : "rgba(255,255,255,0.8)",
                        fontSize: 28, fontWeight: 800, color: DARK, outline: "none",
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                    }}
                />
            ))}
        </div>
    );
}
