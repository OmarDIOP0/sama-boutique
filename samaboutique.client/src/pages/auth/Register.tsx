import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { User, Eye, EyeOff, ArrowRight, ArrowLeft, Check, Mail } from "lucide-react";
import { authApi } from "@/api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import {
    AuthShell, StepProgress, GoogleButton, OrSeparator, PrimaryBtn,
    ContactField, OtpBoxes, inputBase, fieldFocus, fieldBlur,
    GOLD, DARK, GREEN,
} from "@/components/auth/AuthBits";
import {
    detectContactKind, isContactValid, contactValue, formatPhone,
} from "@/lib/contact";

const QUOTES: Record<number, string> = {
    1: "L'élégance commence par un premier pas.",
    2: "Un instant pour vérifier, une vie pour briller.",
    3: "Bienvenue dans la famille SamaBoutique.",
};
const STRENGTH = [
    { label: "", color: "transparent" },
    { label: "Faible", color: "#DC2626" },
    { label: "Moyen", color: "#F59E0B" },
    { label: "Fort", color: GOLD },
    { label: "Très fort", color: GREEN },
];
function passwordScore(pw: string): number {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return Math.min(s, 4);
}

export default function Register() {
    const navigate = useNavigate();
    const setAuth = useAuthStore((s) => s.setAuth);

    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState<"forward" | "back">("forward");
    const [contact, setContact] = useState("");
    const [touched, setTouched] = useState(false);
    const [channel, setChannel] = useState<"sms" | "email">("sms");
    const [devCode, setDevCode] = useState<string | null>(null);
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState(false);
    const [verifyToken, setVerifyToken] = useState("");
    const [nom, setNom] = useState("");
    const [password, setPassword] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [resend, setResend] = useState(59);

    const kind = detectContactKind(contact);
    const contactOk = isContactValid(contact);
    const otpLength = channel === "email" ? 6 : 4;
    const score = passwordScore(password);
    const animClass = direction === "forward" ? "auth-in-right" : "auth-in-left";

    useEffect(() => {
        if (step !== 2) return;
        setResend(59);
        const id = setInterval(() => setResend((r) => (r > 0 ? r - 1 : 0)), 1000);
        return () => clearInterval(id);
    }, [step]);

    // ── Mutations ──
    const sendMut = useMutation({
        mutationFn: () => authApi.sendOtp(contactValue(contact)),
        onSuccess: (res) => {
            const d = res.data.data;
            setChannel(d.channel);
            setDevCode(d.devCode ?? null);
            setOtp(""); setOtpError(false);
            setDirection("forward"); setStep(2);
            if (d.devCode) toast.info(`Code (dev) : ${d.devCode}`);
        },
        onError: (e) => toast.error((e as Error).message),
    });

    const verifyMut = useMutation({
        mutationFn: (code: string) => authApi.verifyOtp(contactValue(contact), code),
        onSuccess: (res) => {
            setVerifyToken(res.data.data.verifyToken);
            setDirection("forward"); setStep(3);
        },
        onError: (e) => { setOtpError(true); toast.error((e as Error).message); setTimeout(() => setOtpError(false), 500); },
    });

    const resendMut = useMutation({
        mutationFn: () => authApi.resendOtp(contactValue(contact)),
        onSuccess: (res) => {
            const d = res.data.data;
            setDevCode(d.devCode ?? null);
            setResend(59); setOtp(""); setOtpError(false);
            toast.success("Nouveau code envoyé");
            if (d.devCode) toast.info(`Code (dev) : ${d.devCode}`);
        },
        onError: (e) => toast.error((e as Error).message),
    });

    const registerMut = useMutation({
        mutationFn: () => authApi.registerOtp({ nom: nom.trim(), password, verifyToken }),
        onSuccess: (res) => {
            const d = res.data.data;
            setAuth(d.accessToken, d.refreshToken, d.user);
            setDirection("forward"); setStep(4);
            toast.success(`🎉 Bienvenue sur SamaBoutique, ${nom.trim().split(" ")[0]} !`);
            setTimeout(() => navigate("/catalogue"), 1500);
        },
        onError: (e) => toast.error((e as Error).message),
    });

    const contactDisplay = channel === "sms" ? `+221 ${formatPhone(contact)}` : contactValue(contact);

    return (
        <AuthShell quote={QUOTES[Math.min(step, 3)]}>
            {step < 4 && <StepProgress step={step} labels={["Contact", "Vérification", "Profil"]} />}

            {/* ════════ ÉTAPE 1 — CONTACT ════════ */}
            {step === 1 && (
                <div key="s1" className={animClass}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: DARK }}>Créer un compte</h1>
                    <p className="mb-6" style={{ fontSize: 14, color: "rgba(81,49,2,0.55)", marginTop: 4 }}>
                        Déjà un compte ? <Link to="/login" style={{ color: GOLD, fontWeight: 600 }}>Se connecter</Link>
                    </p>

                    <GoogleButton label="Continuer avec Google" />
                    <OrSeparator />

                    <label className="block mb-1.5" style={{ fontSize: 13.5, fontWeight: 600, color: DARK }}>Téléphone ou Email *</label>
                    <ContactField value={contact} onChange={(v) => { setContact(v); setTouched(true); }} invalid={touched && contact.length > 0 && kind !== "foreign" && !contactOk} autoFocus />

                    {kind === "foreign" && (
                        <p className="mt-2" style={{ fontSize: 12.5, color: GOLD }}>
                            📧 Pour les numéros étrangers, veuillez utiliser votre email.
                        </p>
                    )}
                    {touched && contact.length > 0 && kind !== "foreign" && !contactOk && (
                        <p className="mt-1.5 text-xs" style={{ color: "#DC2626" }}>
                            {kind === "email" ? "Email invalide" : "Numéro invalide (70/75/76/77/78)"}
                        </p>
                    )}

                    <div className="mt-5">
                        <PrimaryBtn disabled={!contactOk} loading={sendMut.isPending} onClick={() => sendMut.mutate()}>
                            {sendMut.isPending ? "Envoi du code…" : <>Continuer <ArrowRight className="w-4 h-4" /></>}
                        </PrimaryBtn>
                    </div>
                </div>
            )}

            {/* ════════ ÉTAPE 2 — OTP ════════ */}
            {step === 2 && (
                <div key="s2" className={animClass}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: DARK }}>Vérification</h1>
                    <p className="mb-7" style={{ fontSize: 14, color: "rgba(81,49,2,0.55)", marginTop: 4 }}>
                        {channel === "sms"
                            ? <>Code envoyé par SMS au <strong style={{ color: DARK }}>{contactDisplay}</strong></>
                            : <>Code envoyé à <strong style={{ color: DARK }}>{contactDisplay}</strong></>}
                        {" · "}
                        <button onClick={() => { setDirection("back"); setStep(1); }} style={{ color: GOLD, fontWeight: 600, cursor: "pointer" }}>Modifier</button>
                    </p>

                    <OtpBoxes value={otp} onChange={setOtp} length={otpLength} error={otpError}
                        onComplete={(v) => verifyMut.mutate(v)} />

                    {devCode && (
                        <p className="text-center mt-3" style={{ fontSize: 12, color: "rgba(81,49,2,0.45)" }}>
                            Code de test : <strong style={{ color: GOLD }}>{devCode}</strong>
                        </p>
                    )}

                    <div className="text-center my-6">
                        {resend > 0 ? (
                            <p style={{ fontSize: 13, color: "rgba(81,49,2,0.45)" }}>Renvoyer dans <strong>{resend}s</strong></p>
                        ) : (
                            <>
                                <p style={{ fontSize: 13, color: "rgba(81,49,2,0.55)", marginBottom: 6 }}>Vous n'avez pas reçu le code ?</p>
                                <button onClick={() => resendMut.mutate()} style={{ fontSize: 13.5, color: GOLD, fontWeight: 700, cursor: "pointer" }}>Renvoyer →</button>
                            </>
                        )}
                        {channel === "email" && (
                            <button onClick={() => window.open("https://mail.google.com", "_blank")}
                                className="mt-3 inline-flex items-center gap-2 px-4 h-9 rounded-lg"
                                style={{ background: "rgba(81,49,2,0.05)", border: "1px solid rgba(81,49,2,0.10)", fontSize: 13, color: DARK, cursor: "pointer" }}>
                                <Mail className="w-3.5 h-3.5" /> Ouvrir ma boîte mail ↗
                            </button>
                        )}
                    </div>

                    <PrimaryBtn disabled={otp.length !== otpLength} loading={verifyMut.isPending} onClick={() => verifyMut.mutate(otp)}>
                        {verifyMut.isPending ? "Vérification…" : <>Vérifier <ArrowRight className="w-4 h-4" /></>}
                    </PrimaryBtn>
                </div>
            )}

            {/* ════════ ÉTAPE 3 — PROFIL ════════ */}
            {step === 3 && (
                <div key="s3" className={animClass}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: DARK }}>Dernière étape !</h1>
                    <p className="mb-6" style={{ fontSize: 14, color: "rgba(81,49,2,0.55)", marginTop: 4 }}>Personnalisez votre compte</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block mb-1.5" style={{ fontSize: 13.5, fontWeight: 600, color: DARK }}>Nom complet *</label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: GOLD }} />
                                <input value={nom} onChange={(e) => setNom(e.target.value)} onFocus={fieldFocus} onBlur={(e) => fieldBlur(e)}
                                    placeholder="Fatou Diallo" style={{ ...inputBase, paddingLeft: 42, paddingRight: 14 }} autoFocus />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1.5" style={{ fontSize: 13.5, fontWeight: 600, color: DARK }}>Mot de passe *</label>
                            <div className="relative">
                                <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPwd ? "text" : "password"}
                                    onFocus={fieldFocus} onBlur={(e) => fieldBlur(e)} placeholder="Min. 8 caractères"
                                    style={{ ...inputBase, paddingLeft: 14, paddingRight: 44 }} />
                                <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(81,49,2,0.40)", cursor: "pointer" }}>
                                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {password.length > 0 && (
                                <div className="mt-2">
                                    <div className="flex items-center gap-2">
                                        <div className="flex gap-1.5 flex-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= score ? STRENGTH[score].color : "rgba(81,49,2,0.10)", transition: "background .2s" }} />
                                            ))}
                                        </div>
                                        {score > 0 && <span style={{ fontSize: 11, color: STRENGTH[score].color, fontWeight: 600 }}>{STRENGTH[score].label}</span>}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="pt-1 space-y-2">
                            <PrimaryBtn gradient disabled={nom.trim().length < 2 || password.length < 8} loading={registerMut.isPending} onClick={() => registerMut.mutate()}>
                                {registerMut.isPending ? "Création du compte…" : "Créer mon compte"}
                            </PrimaryBtn>
                            <button onClick={() => { setDirection("back"); setStep(2); }}
                                className="w-full flex items-center justify-center gap-2" style={{ height: 44, color: "rgba(81,49,2,0.55)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                                <ArrowLeft className="w-4 h-4" /> Retour
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ════════ SUCCÈS ════════ */}
            {step === 4 && (
                <div key="s4" className="text-center py-6">
                    <div className="auth-pop mx-auto flex items-center justify-center rounded-full mb-6" style={{ width: 88, height: 88, background: "rgba(45,122,79,0.12)", border: `2px solid ${GREEN}` }}>
                        <Check className="w-11 h-11" style={{ color: GREEN }} strokeWidth={3} />
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: DARK }}>Compte créé ! 🎉</h1>
                    <p style={{ fontSize: 14.5, color: "rgba(81,49,2,0.60)", marginTop: 8 }}>
                        Bienvenue {nom.trim().split(" ")[0]} ! Redirection vers le catalogue…
                    </p>
                </div>
            )}
        </AuthShell>
    );
}
