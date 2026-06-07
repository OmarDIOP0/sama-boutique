import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Store, Eye, EyeOff, Loader2, Phone } from "lucide-react";
import { useState } from "react";
import { loginSchema, phoneLoginSchema, type LoginFormData, type PhoneLoginFormData } from "@/lib/validators";
import { useLogin } from "@/hooks/useAuth";

/* ── Wurus brand tokens ───────────────────────────────────────────────────── */
const W_GOLD = "#C7932D";
const W_DARK = "#513102";
const W_MUTED = "rgba(81,49,2,0.55)";
const W_BG = "#FDFAF7";

/* ── Google button ────────────────────────────────────────────────────────── */
function GoogleButton({ label }: { label: string }) {
    return (
        <button
            type="button"
            onClick={() => {
                window.location.href = "https://localhost:7088/api/auth/google";
            }}
            className="w-full h-12 flex items-center justify-center gap-3 rounded-xl text-sm font-medium transition-all hover:bg-gray-50"
            style={{ border: "1.5px solid rgba(81,49,2,0.12)", background: "white", color: W_DARK }}
        >
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

interface Props {
    isClient?: boolean;
}

// ── Formulaire EMAIL (admin) ───────────────────────────────────────────────────
function EmailForm({ onError }: { onError?: string }) {
    const [showPassword, setShowPassword] = useState(false);
    const loginMutation = useLogin();

    const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "admin@samaboutique.com", password: "Admin@2025!" },
    });

    return (
        <>
            {loginMutation.error && (
                <div className="p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                    <p className="text-sm" style={{ color: "#DC2626" }}>{(loginMutation.error as Error).message}</p>
                </div>
            )}
            <form onSubmit={handleSubmit((d) => loginMutation.mutate(d))} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: W_DARK }}>Email</label>
                    <input {...register("email")} type="email" autoComplete="email" className="wurus-input"
                        style={errors.email ? { borderColor: "#EF4444" } : undefined} placeholder="admin@samaboutique.com" />
                    {errors.email && <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>{errors.email.message}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: W_DARK }}>Mot de passe</label>
                    <div className="relative">
                        <input {...register("password")} type={showPassword ? "text" : "password"}
                            autoComplete="current-password" className="wurus-input"
                            style={{ paddingRight: "2.5rem", ...(errors.password ? { borderColor: "#EF4444" } : {}) }}
                            placeholder="••••••••" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                            style={{ color: W_MUTED }}>
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.password && <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>{errors.password.message}</p>}
                </div>
                <button type="submit" disabled={loginMutation.isPending}
                    className="w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all mt-2"
                    style={{ background: W_GOLD, color: "white", borderRadius: 12 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#b08024"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = W_GOLD; }}>
                    {loginMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loginMutation.isPending ? "Connexion…" : "Se connecter"}
                </button>
            </form>
            <div className="p-3 rounded-xl" style={{ background: "rgba(81,49,2,0.03)", border: "1px solid rgba(81,49,2,0.07)" }}>
                <p className="text-xs font-medium mb-1" style={{ color: W_MUTED }}>Compte démo :</p>
                <p className="text-xs" style={{ color: W_MUTED }}>admin@samaboutique.com · Admin@2025!</p>
            </div>
        </>
    );
}

// ── Formulaire TÉLÉPHONE (clients storefront) ─────────────────────────────────
function PhoneForm() {
    const [showPassword, setShowPassword] = useState(false);
    const [rawPhone, setRawPhone] = useState("");
    const loginMutation = useLogin();

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<PhoneLoginFormData>({
        resolver: zodResolver(phoneLoginSchema),
        defaultValues: { phone: "", password: "" },
    });

    // Formattage automatique XX XXX XX XX
    const formatPhone = (val: string) => {
        const digits = val.replace(/\D/g, "").slice(0, 9);
        let formatted = digits;
        if (digits.length > 2) formatted = digits.slice(0, 2) + " " + digits.slice(2);
        if (digits.length > 5) formatted = formatted.slice(0, 6) + " " + formatted.slice(6);
        if (digits.length > 7) formatted = formatted.slice(0, 9) + " " + formatted.slice(9);
        return formatted;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
        setRawPhone(formatPhone(e.target.value));
        setValue("phone", digits, { shouldValidate: digits.length === 9 });
    };

    const onSubmit = (data: PhoneLoginFormData) => {
        // Envoyer +221 + numéro en tant que "email" vers le backend
        const fullPhone = "+221" + data.phone.replace(/\s/g, "");
        loginMutation.mutate({ email: fullPhone, password: data.password });
    };

    return (
        <>
            {loginMutation.error && (
                <div className="p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                    <p className="text-sm" style={{ color: "#DC2626" }}>{(loginMutation.error as Error).message}</p>
                </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* Numéro de téléphone */}
                <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: W_DARK }}>
                        Numéro de téléphone
                    </label>
                    <div className="relative flex items-center">
                        {/* Préfixe +221 🇸🇳 fixe */}
                        <div
                            className="absolute left-0 h-full flex items-center justify-center px-3 gap-1.5 select-none"
                            style={{
                                borderRight: "1.5px solid rgba(199,147,45,0.25)",
                                color: W_DARK, fontWeight: 600, fontSize: 15, minWidth: 72,
                            }}
                        >
                            <span style={{ fontSize: 18 }}>🇸🇳</span>
                            <span>+221</span>
                        </div>
                        <input
                            value={rawPhone}
                            onChange={handlePhoneChange}
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel"
                            placeholder="77 123 45 67"
                            className="wurus-input w-full"
                            style={{
                                paddingLeft: 84,
                                fontSize: 18,
                                letterSpacing: "0.05em",
                                fontWeight: 600,
                                ...(errors.phone ? { borderColor: "#EF4444" } : {}),
                            }}
                        />
                        <Phone className="absolute right-3 w-4 h-4" style={{ color: "rgba(199,147,45,0.50)" }} />
                    </div>
                    {errors.phone && (
                        <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>{errors.phone.message}</p>
                    )}
                    <p className="mt-1.5 text-xs" style={{ color: W_MUTED }}>
                        Opérateurs acceptés : Wave, Orange, Free, Expresso
                    </p>
                </div>

                {/* Mot de passe */}
                <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: W_DARK }}>
                        Mot de passe
                    </label>
                    <div className="relative">
                        <input
                            {...register("password")}
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            className="wurus-input"
                            style={{ paddingRight: "2.5rem", ...(errors.password ? { borderColor: "#EF4444" } : {}) }}
                            placeholder="••••••••"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
                            style={{ color: W_MUTED }}>
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="mt-1 text-xs" style={{ color: "#DC2626" }}>{errors.password.message}</p>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full h-14 rounded-full font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 transition-all mt-2"
                    style={{
                        background: "#513102", color: "#FFF8EE",
                        boxShadow: "0 8px 24px rgba(81,49,2,0.25)",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#3d2509"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#513102"; }}
                >
                    {loginMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loginMutation.isPending ? "Connexion…" : "Se connecter"}
                </button>
            </form>

            {/* Séparateur ou */}
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" style={{ borderColor: "rgba(81,49,2,0.08)" }} />
                </div>
                <div className="relative flex justify-center">
                    <span className="px-3 text-xs" style={{ background: W_BG, color: W_MUTED }}>ou continuer avec</span>
                </div>
            </div>

            {/* Google */}
            <GoogleButton label="Se connecter avec Google" />

            {/* Compte démo client */}
            <div className="p-3 rounded-xl text-center" style={{ background: "rgba(199,147,45,0.05)", border: "1px dashed rgba(199,147,45,0.25)" }}>
                <p className="text-xs font-medium mb-0.5" style={{ color: W_MUTED }}>Compte de test :</p>
                <p className="text-sm font-bold" style={{ color: "#513102" }}>77 000 00 00</p>
                <p className="text-xs" style={{ color: W_MUTED }}>Mot de passe : Client@2025!</p>
            </div>
        </>
    );
}

export default function Login({ isClient = false }: Props) {

    return (
        <div className="min-h-screen flex">

            {/* ── Left decorative panel ─────────────────────────────────────── */}
            <div
                className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative flex-col justify-between p-12"
                style={{ background: "linear-gradient(160deg, #2A1A0F 0%, #1A0E08 50%, #0F0C0A 100%)" }}
            >
                {/* Dot pattern */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: "radial-gradient(circle, rgba(199,147,45,0.18) 1px, transparent 1px)",
                        backgroundSize: "24px 24px",
                    }}
                />

                {/* Gold glow */}
                <div
                    className="absolute top-1/4 -right-20 w-80 h-80 rounded-full opacity-20"
                    style={{ background: "radial-gradient(circle, #C7932D 0%, transparent 70%)" }}
                />

                {/* Logo */}
                <div className="relative flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: W_GOLD }}
                    >
                        <Store className="w-5 h-5 text-white" />
                    </div>
                    <span
                        className="text-xl font-bold text-white"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                        SamaBoutique
                    </span>
                </div>

                {/* Quote */}
                <div className="relative space-y-4">
                    <div className="w-10 h-0.5" style={{ background: `rgba(199,147,45,0.65)` }} />
                    <p
                        className="text-3xl font-normal leading-snug text-white"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic" }}
                    >
                        "L'élégance est la seule beauté qui ne se démode jamais."
                    </p>
                    <p className="text-sm" style={{ color: "rgba(245,240,234,0.5)" }}>
                        — Audrey Hepburn
                    </p>
                </div>

                {/* Footer */}
                <p className="relative text-xs" style={{ color: "rgba(245,240,234,0.3)" }}>
                    © {new Date().getFullYear()} SamaBoutique · Dakar, Sénégal 🇸🇳
                </p>
            </div>

            {/* ── Right: form ───────────────────────────────────────────────── */}
            <div
                className="flex-1 flex items-center justify-center p-6 sm:p-10"
                style={{ background: W_BG }}
            >
                <div className="w-full max-w-[400px] space-y-7">

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 justify-center">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: W_GOLD }}
                        >
                            <Store className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-xl" style={{ color: W_DARK }}>
                            SamaBoutique
                        </span>
                    </div>

                    {/* Header */}
                    <div>
                        <h1
                            className="text-3xl font-bold mb-2"
                            style={{ fontFamily: "'Playfair Display', Georgia, serif", color: W_DARK }}
                        >
                            {isClient ? "Bon retour" : "Connexion Admin"}
                        </h1>
                        <p className="text-sm" style={{ color: W_MUTED }}>
                            {isClient ? (
                                <>
                                    Pas encore de compte ?{" "}
                                    <Link
                                        to="/register"
                                        className="font-medium hover:opacity-80 transition-opacity"
                                        style={{ color: W_GOLD }}
                                    >
                                        S'inscrire
                                    </Link>
                                </>
                            ) : (
                                "Accédez au tableau de bord de gestion"
                            )}
                        </p>
                    </div>

                    {/* ── Formulaire selon le contexte ── */}
                    {isClient ? <PhoneForm /> : <EmailForm />}
                </div>
            </div>
        </div>
    );
}
