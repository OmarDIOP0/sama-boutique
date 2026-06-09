import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
    User, Mail, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft,
    Check, X, ShoppingBag, Pencil,
} from "lucide-react";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import type { RegisterRequest } from "@/types";

/* ── Charte warm ─────────────────────────────────────────────────────────── */
const GOLD = "#C7932D";
const DARK = "#513102";
const CREAM = "#FFF8EE";
const BG_RIGHT = "#FDFAF7";
const PANEL = "#1A0E06";
const GREEN = "#2D7A4F";

const STEPS = [
    { n: 1, label: "Identité" },
    { n: 2, label: "Sécurité" },
    { n: 3, label: "Confirmation" },
];

const QUOTES: Record<number, string> = {
    1: "L'élégance commence par se connaître.",
    2: "La sécurité, c'est la liberté.",
    3: "Chaque grand voyage commence par un premier pas.",
};

/* ── Helpers téléphone ───────────────────────────────────────────────────── */
function formatPhone(digits: string): string {
    const d = digits.slice(0, 9);
    const p = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
    return p.join(" ");
}
const phoneValid = (d: string) => /^(70|75|76|77|78)\d{7}$/.test(d);

/* ── Force du mot de passe ───────────────────────────────────────────────── */
function passwordScore(pw: string): number {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return Math.min(s, 4);
}
const STRENGTH = [
    { label: "", color: "transparent" },
    { label: "Faible", color: "#DC2626" },
    { label: "Moyen", color: "#F59E0B" },
    { label: "Fort", color: GOLD },
    { label: "Très fort", color: GREEN },
];

/* ── Champ générique ─────────────────────────────────────────────────────── */
function Field({
    label, sublabel, icon: Icon, error, children,
}: { label: string; sublabel?: string; icon?: React.ElementType; error?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block mb-1.5" style={{ fontSize: 13.5, fontWeight: 600, color: DARK }}>{label}</label>
            {sublabel && <p style={{ fontSize: 12, color: "rgba(81,49,2,0.50)", marginTop: -4, marginBottom: 6 }}>{sublabel}</p>}
            <div className="relative">
                {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(81,49,2,0.40)" }} />}
                {children}
            </div>
            {error && <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>{error}</p>}
        </div>
    );
}

const inputBase: React.CSSProperties = {
    width: "100%", height: 52, borderRadius: 14, border: "1.5px solid rgba(81,49,2,0.14)",
    background: "white", fontSize: 15, color: DARK, outline: "none",
    fontFamily: "'Bricolage Grotesque', sans-serif", transition: "border-color .2s, box-shadow .2s",
};
function focusOn(e: React.FocusEvent<HTMLInputElement>) {
    e.currentTarget.style.borderColor = GOLD;
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(199,147,45,0.20)";
}
function focusOff(e: React.FocusEvent<HTMLInputElement>, err?: boolean) {
    e.currentTarget.style.borderColor = err ? "#EF4444" : "rgba(81,49,2,0.14)";
    e.currentTarget.style.boxShadow = "none";
}

/* ── Bouton CTA principal ────────────────────────────────────────────────── */
function PrimaryBtn({ children, disabled, onClick, type = "button", loading, gradient }: {
    children: React.ReactNode; disabled?: boolean; onClick?: () => void;
    type?: "button" | "submit"; loading?: boolean; gradient?: boolean;
}) {
    return (
        <button
            type={type} onClick={onClick} disabled={disabled || loading}
            className="w-full flex items-center justify-center gap-2 font-bold disabled:opacity-50 transition-all"
            style={{
                height: gradient ? 56 : 52, borderRadius: 14, color: "white", fontSize: 15,
                background: gradient ? "linear-gradient(to right, #C7932D, #b08024)" : GOLD,
                boxShadow: gradient ? "0 8px 24px rgba(199,147,45,0.35)" : "none",
                cursor: disabled || loading ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => { if (!disabled && !loading && !gradient) (e.currentTarget as HTMLElement).style.background = "#b08024"; }}
            onMouseLeave={(e) => { if (!gradient) (e.currentTarget as HTMLElement).style.background = GOLD; }}
        >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {children}
        </button>
    );
}

/* ── Bouton retour (ghost) ───────────────────────────────────────────────── */
function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
    return (
        <button type="button" onClick={onClick}
            className="w-full flex items-center justify-center gap-2 transition-colors"
            style={{ height: 48, borderRadius: 14, background: "transparent", color: "rgba(81,49,2,0.55)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(81,49,2,0.04)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            {children}
        </button>
    );
}

/* ── Saisie OTP ──────────────────────────────────────────────────────────── */
function OtpInput({ value, onChange, length = 4 }: { value: string; onChange: (v: string) => void; length?: number }) {
    const refs = useRef<(HTMLInputElement | null)[]>([]);
    const chars = Array.from({ length }, (_, i) => value[i] ?? "");

    const setAt = (i: number, c: string) => {
        const next = chars.slice();
        next[i] = c;
        onChange(next.join("").slice(0, length));
    };

    return (
        <div className="flex items-center justify-center gap-3">
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
                    onKeyDown={(e) => {
                        if (e.key === "Backspace" && !chars[i] && i > 0) refs.current[i - 1]?.focus();
                    }}
                    onPaste={(e) => {
                        e.preventDefault();
                        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
                        if (pasted) { onChange(pasted); refs.current[Math.min(pasted.length, length - 1)]?.focus(); }
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(199,147,45,0.20)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = c ? "rgba(199,147,45,0.40)" : "rgba(81,49,2,0.15)"; e.currentTarget.style.boxShadow = "none"; }}
                    style={{
                        width: 64, height: 72, borderRadius: 14, textAlign: "center",
                        border: `2px solid ${c ? "rgba(199,147,45,0.40)" : "rgba(81,49,2,0.15)"}`,
                        background: c ? "rgba(199,147,45,0.06)" : "rgba(255,255,255,0.8)",
                        fontSize: 28, fontWeight: 800, color: DARK, outline: "none",
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                    }}
                />
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function Register() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);

    const [step, setStep] = useState(1);                 // 1 | 2 | 3 | 4(succès)
    const [direction, setDirection] = useState<"forward" | "back">("forward");

    const [nom, setNom] = useState("");
    const [tel, setTel] = useState("");                  // 9 chiffres
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [touched, setTouched] = useState<{ nom?: boolean; tel?: boolean }>({});

    // Timer renvoi OTP
    const [resend, setResend] = useState(59);
    useEffect(() => {
        if (step !== 3) return;
        setResend(59);
        const id = setInterval(() => setResend((r) => (r > 0 ? r - 1 : 0)), 1000);
        return () => clearInterval(id);
    }, [step]);

    const registerMut = useMutation({
        mutationFn: async () => {
            const finalEmail = email.trim() || `${tel}@phone.samaboutique.sn`;
            const payload: RegisterRequest = {
                nom: nom.trim(), email: finalEmail, password, telephone: `+221${tel}`,
            };
            const res = await authApi.register(payload);
            return res.data.data;
        },
        onSuccess: (data) => {
            setAuth(data.accessToken, data.refreshToken, data.user);
            setDirection("forward");
            setStep(4);
        },
    });

    const score = passwordScore(password);
    const step1Valid = nom.trim().length >= 2 && phoneValid(tel);
    const step2Valid = password.length >= 8 && password === confirm;
    const step3Valid = otp.length === 4;

    const goNext = () => { setDirection("forward"); setStep((s) => s + 1); };
    const goBack = () => { setDirection("back"); setStep((s) => Math.max(1, s - 1)); };

    const animClass = direction === "forward" ? "reg-in-right" : "reg-in-left";
    const prenom = nom.trim().split(" ")[0] || "";

    return (
        <div className="min-h-screen flex" style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}>
            <style>{`
        @keyframes regInRight { from { opacity:0; transform: translateX(40px);} to {opacity:1; transform:translateX(0);} }
        @keyframes regInLeft  { from { opacity:0; transform: translateX(-40px);} to {opacity:1; transform:translateX(0);} }
        @keyframes regPop { 0%{opacity:0; transform:scale(0.5);} 60%{transform:scale(1.12);} 100%{opacity:1; transform:scale(1);} }
        .reg-in-right { animation: regInRight .28s ease-out; }
        .reg-in-left  { animation: regInLeft .28s ease-out; }
        .reg-pop { animation: regPop .5s cubic-bezier(0.16,1,0.3,1); }
      `}</style>

            {/* ── Panneau gauche ─────────────────────────────────────────────── */}
            <div className="hidden lg:flex lg:w-[40%] relative flex-col justify-between p-12" style={{ background: PANEL }}>
                <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, rgba(199,147,45,0.18) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full" style={{ background: "radial-gradient(circle, rgba(199,147,45,0.35) 0%, transparent 70%)" }} />

                {/* Logo */}
                <div className="relative flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: GOLD, boxShadow: "0 3px 14px rgba(199,147,45,0.40)" }}>
                        <span style={{ fontStyle: "italic", fontWeight: 800, fontSize: 22, color: CREAM }}>S</span>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 21, color: CREAM }}>
                        Sama<span style={{ fontStyle: "italic", color: GOLD }}>Boutique</span>
                    </span>
                </div>

                {/* Citation */}
                <div className="relative space-y-4">
                    <div className="w-10 h-0.5" style={{ background: "rgba(199,147,45,0.65)" }} />
                    <p key={step} className="reg-in-right" style={{ fontSize: 30, lineHeight: 1.25, color: CREAM, fontStyle: "italic", fontWeight: 600, maxWidth: 380 }}>
                        « {QUOTES[Math.min(step, 3)]} »
                    </p>
                </div>

                {/* Indicateur vertical */}
                <div className="relative flex items-center gap-2.5">
                    {STEPS.map(({ n }) => (
                        <div key={n} className="rounded-full transition-all" style={{
                            width: step === n ? 28 : 8, height: 8,
                            background: step >= n ? GOLD : "rgba(255,248,238,0.20)",
                        }} />
                    ))}
                </div>
            </div>

            {/* ── Panneau droit ──────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10" style={{ background: BG_RIGHT }}>
                <div className="w-full max-w-[440px]">

                    {/* Logo mobile */}
                    <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: GOLD }}>
                            <span style={{ fontStyle: "italic", fontWeight: 800, fontSize: 18, color: CREAM }}>S</span>
                        </div>
                        <span className="font-bold text-xl" style={{ color: DARK }}>SamaBoutique</span>
                    </div>

                    {/* Indicateur de progression */}
                    {step < 4 && (
                        <div className="mb-9">
                            <div className="flex items-start justify-between" style={{ maxWidth: 360, margin: "0 auto" }}>
                                {STEPS.map(({ n, label }, i) => {
                                    const done = step > n;
                                    const active = step === n;
                                    return (
                                        <div key={n} className="flex-1 flex flex-col items-center relative">
                                            {/* barre vers le suivant */}
                                            {i < STEPS.length - 1 && (
                                                <div className="absolute" style={{ top: 17, left: "50%", right: "-50%", height: 3, borderRadius: 3, background: "rgba(81,49,2,0.08)" }}>
                                                    <div style={{ height: "100%", borderRadius: 3, background: GOLD, width: step > n ? "100%" : "0%", transition: "width .5s ease" }} />
                                                </div>
                                            )}
                                            {/* cercle */}
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
                        </div>
                    )}

                    {/* Erreur API */}
                    {registerMut.error && step === 3 && (
                        <div className="mb-4 p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
                            <p className="text-sm" style={{ color: "#DC2626" }}>{(registerMut.error as Error).message}</p>
                        </div>
                    )}

                    {/* ════════ ÉTAPE 1 — IDENTITÉ ════════ */}
                    {step === 1 && (
                        <div key="s1" className={animClass}>
                            <h1 style={{ fontSize: 28, fontWeight: 700, color: DARK }}>Qui êtes-vous ?</h1>
                            <p className="mb-6" style={{ fontSize: 14, color: "rgba(81,49,2,0.55)", marginTop: 4 }}>
                                Ces informations apparaîtront sur votre compte
                            </p>

                            {/* Google */}
                            <button type="button" onClick={() => { window.location.href = "https://localhost:7088/api/auth/google"; }}
                                className="w-full h-12 flex items-center justify-center gap-3 rounded-xl font-medium transition-colors"
                                style={{ border: "1.5px solid rgba(81,49,2,0.12)", background: "white", color: DARK, fontSize: 14, cursor: "pointer" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#faf6f0")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "white")}>
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                    <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z" />
                                    <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z" />
                                    <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z" />
                                    <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.31z" />
                                </svg>
                                Continuer avec Google
                            </button>

                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: "rgba(81,49,2,0.08)" }} /></div>
                                <div className="relative flex justify-center"><span className="px-3 text-xs" style={{ background: BG_RIGHT, color: "rgba(81,49,2,0.45)" }}>ou</span></div>
                            </div>

                            <div className="space-y-4">
                                <Field label="Nom complet *" icon={User} error={touched.nom && nom.trim().length < 2 ? "Au moins 2 caractères" : undefined}>
                                    <input value={nom} onChange={(e) => setNom(e.target.value)} onBlur={(e) => { setTouched((t) => ({ ...t, nom: true })); focusOff(e, nom.trim().length > 0 && nom.trim().length < 2); }}
                                        onFocus={focusOn} placeholder="Ex : Fatou Diallo"
                                        style={{ ...inputBase, paddingLeft: 42, paddingRight: 14 }} />
                                </Field>

                                <Field label="Numéro de téléphone *" error={touched.tel && tel.length > 0 && !phoneValid(tel) ? "Numéro sénégalais invalide (70/75/76/77/78)" : undefined}>
                                    <div className="flex items-stretch" style={{ ...inputBase, padding: 0, overflow: "hidden" }}>
                                        <div className="flex items-center gap-1.5 px-3 flex-shrink-0" style={{ background: "rgba(81,49,2,0.05)", borderRight: "1.5px solid rgba(81,49,2,0.10)", fontSize: 15, fontWeight: 600, color: DARK }}>
                                            🇸🇳 +221
                                        </div>
                                        <input value={formatPhone(tel)} inputMode="numeric"
                                            onChange={(e) => setTel(e.target.value.replace(/\D/g, "").slice(0, 9))}
                                            onBlur={(e) => { setTouched((t) => ({ ...t, tel: true })); (e.currentTarget.parentElement as HTMLElement).style.boxShadow = "none"; (e.currentTarget.parentElement as HTMLElement).style.borderColor = tel.length > 0 && !phoneValid(tel) ? "#EF4444" : "rgba(81,49,2,0.14)"; }}
                                            onFocus={(e) => { (e.currentTarget.parentElement as HTMLElement).style.borderColor = GOLD; (e.currentTarget.parentElement as HTMLElement).style.boxShadow = "0 0 0 3px rgba(199,147,45,0.20)"; }}
                                            placeholder="77 000 00 00"
                                            style={{ flex: 1, border: "none", outline: "none", background: "transparent", padding: "0 14px", fontSize: 15, color: DARK, fontFamily: "inherit" }} />
                                    </div>
                                </Field>

                                <div className="pt-1">
                                    <PrimaryBtn disabled={!step1Valid} onClick={goNext}>
                                        Continuer <ArrowRight className="w-4 h-4" />
                                    </PrimaryBtn>
                                </div>

                                <p className="text-center" style={{ fontSize: 13.5, color: "rgba(81,49,2,0.55)" }}>
                                    Déjà un compte ?{" "}
                                    <Link to="/login" style={{ color: GOLD, fontWeight: 600 }}>Se connecter</Link>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ════════ ÉTAPE 2 — SÉCURITÉ ════════ */}
                    {step === 2 && (
                        <div key="s2" className={animClass}>
                            <h1 style={{ fontSize: 28, fontWeight: 700, color: DARK }}>Sécurisez votre compte</h1>
                            <p className="mb-5" style={{ fontSize: 14, color: "rgba(81,49,2,0.55)", marginTop: 4 }}>
                                Choisissez un mot de passe fort
                            </p>

                            {/* Récap étape 1 */}
                            <div className="flex items-center justify-between mb-5 p-3.5 rounded-xl" style={{ background: "rgba(81,49,2,0.04)", border: "1px solid rgba(81,49,2,0.08)" }}>
                                <div className="min-w-0">
                                    <p className="truncate" style={{ fontSize: 13.5, fontWeight: 600, color: DARK }}>👤 {nom}</p>
                                    <p style={{ fontSize: 12.5, color: "rgba(81,49,2,0.55)", marginTop: 2 }}>📱 +221 {formatPhone(tel)}</p>
                                </div>
                                <button onClick={() => { setDirection("back"); setStep(1); }} className="flex items-center gap-1 flex-shrink-0" style={{ fontSize: 12.5, fontWeight: 600, color: GOLD, cursor: "pointer" }}>
                                    <Pencil className="w-3.5 h-3.5" /> Modifier
                                </button>
                            </div>

                            <div className="space-y-4">
                                <Field label="Mot de passe *" icon={undefined}>
                                    <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPwd ? "text" : "password"}
                                        onFocus={focusOn} onBlur={(e) => focusOff(e)} placeholder="Min. 8 caractères"
                                        style={{ ...inputBase, paddingLeft: 14, paddingRight: 44 }} />
                                    <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(81,49,2,0.45)", cursor: "pointer" }}>
                                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </Field>

                                {/* Force */}
                                {password.length > 0 && (
                                    <div>
                                        <div className="flex gap-1.5">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= score ? STRENGTH[score].color : "rgba(81,49,2,0.10)", transition: "background .2s" }} />
                                            ))}
                                        </div>
                                        {score > 0 && <p style={{ fontSize: 12, color: STRENGTH[score].color, marginTop: 5, fontWeight: 600 }}>{STRENGTH[score].label}</p>}
                                    </div>
                                )}

                                <Field label="Confirmer le mot de passe *">
                                    <input value={confirm} onChange={(e) => setConfirm(e.target.value)} type={showPwd ? "text" : "password"}
                                        onFocus={focusOn} onBlur={(e) => focusOff(e)} placeholder="••••••••"
                                        style={{ ...inputBase, paddingLeft: 14, paddingRight: 44 }} />
                                    {confirm.length > 0 && (
                                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                            {password === confirm
                                                ? <Check className="w-4 h-4" style={{ color: GREEN }} />
                                                : <X className="w-4 h-4" style={{ color: "#DC2626" }} />}
                                        </span>
                                    )}
                                </Field>

                                <Field label="Email (optionnel)" sublabel="Pour recevoir vos factures et confirmations" icon={Mail}>
                                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                                        onFocus={focusOn} onBlur={(e) => focusOff(e)} placeholder="votre@email.com"
                                        style={{ ...inputBase, paddingLeft: 42, paddingRight: 14 }} />
                                </Field>

                                <div className="pt-1 space-y-2">
                                    <PrimaryBtn disabled={!step2Valid} onClick={goNext}>
                                        Continuer <ArrowRight className="w-4 h-4" />
                                    </PrimaryBtn>
                                    <GhostBtn onClick={goBack}><ArrowLeft className="w-4 h-4" /> Retour</GhostBtn>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════════ ÉTAPE 3 — CONFIRMATION ════════ */}
                    {step === 3 && (
                        <div key="s3" className={animClass}>
                            <h1 style={{ fontSize: 28, fontWeight: 700, color: DARK }}>Vérification du numéro</h1>
                            <p className="mb-7" style={{ fontSize: 14, color: "rgba(81,49,2,0.55)", marginTop: 4 }}>
                                Un code a été envoyé au <strong style={{ color: DARK }}>+221 {formatPhone(tel)}</strong>
                            </p>

                            <OtpInput value={otp} onChange={setOtp} length={4} />

                            {/* Timer renvoi */}
                            <div className="text-center my-6">
                                {resend > 0 ? (
                                    <p style={{ fontSize: 13.5, color: "rgba(81,49,2,0.45)" }}>
                                        Renvoyer dans <strong>{resend}s</strong>
                                    </p>
                                ) : (
                                    <button onClick={() => setResend(59)} style={{ fontSize: 13.5, color: GOLD, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                                        Renvoyer le code <ArrowRight className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-2">
                                <PrimaryBtn gradient disabled={!step3Valid} loading={registerMut.isPending} onClick={() => registerMut.mutate()}>
                                    {registerMut.isPending ? "Création en cours…" : "Créer mon compte"}
                                </PrimaryBtn>
                                <GhostBtn onClick={() => { setDirection("back"); setStep(1); }}><ArrowLeft className="w-4 h-4" /> Modifier le numéro</GhostBtn>
                            </div>
                        </div>
                    )}

                    {/* ════════ SUCCÈS ════════ */}
                    {step === 4 && (
                        <div key="s4" className="text-center">
                            <div className="reg-pop mx-auto flex items-center justify-center rounded-full mb-6" style={{ width: 84, height: 84, background: "rgba(45,122,79,0.12)", border: `2px solid ${GREEN}` }}>
                                <Check className="w-10 h-10" style={{ color: GREEN }} strokeWidth={3} />
                            </div>
                            <h1 style={{ fontSize: 28, fontWeight: 700, color: DARK }}>Compte créé ! 🎉</h1>
                            <p className="mb-6" style={{ fontSize: 14.5, color: "rgba(81,49,2,0.60)", marginTop: 6 }}>
                                Bienvenue sur SamaBoutique{prenom ? `, ${prenom}` : ""} !
                            </p>

                            <div className="text-left p-4 rounded-2xl mb-7" style={{ background: "rgba(199,147,45,0.06)", border: "1px solid rgba(199,147,45,0.20)" }}>
                                {[
                                    { k: "Nom", v: nom },
                                    { k: "Téléphone", v: `+221 ${formatPhone(tel)}` },
                                    ...(email.trim() ? [{ k: "Email", v: email.trim() }] : []),
                                ].map(({ k, v }) => (
                                    <div key={k} className="flex justify-between items-center py-1.5">
                                        <span style={{ fontSize: 13, color: "rgba(81,49,2,0.55)" }}>{k}</span>
                                        <span style={{ fontSize: 13.5, fontWeight: 600, color: DARK }}>{v}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-2.5">
                                <button onClick={() => navigate("/")}
                                    className="w-full flex items-center justify-center gap-2 font-bold transition-all"
                                    style={{ height: 52, borderRadius: 14, background: DARK, color: CREAM, fontSize: 15, cursor: "pointer" }}>
                                    <ShoppingBag className="w-4 h-4" /> Découvrir le catalogue
                                </button>
                                <button onClick={() => navigate("/compte")}
                                    className="w-full flex items-center justify-center gap-2 font-semibold transition-colors"
                                    style={{ height: 48, borderRadius: 14, background: "transparent", color: GOLD, fontSize: 14, cursor: "pointer" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(199,147,45,0.08)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                                    Aller à mon compte
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
