import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "@/hooks/useAuth";
import {
    AuthShell, GoogleButton, OrSeparator, PrimaryBtn, ContactField,
    inputBase, fieldFocus, fieldBlur, GOLD, DARK,
} from "@/components/auth/AuthBits";
import { contactValue, isContactValid } from "@/lib/contact";

interface Props { isClient?: boolean }

export default function Login({ isClient = false }: Props) {
    const loginMutation = useLogin();
    const [showPwd, setShowPwd] = useState(false);

    // Champ identifiant (téléphone/email pour client, email pour admin)
    const [contact, setContact] = useState(isClient ? "" : "admin@samaboutique.com");
    const [password, setPassword] = useState(isClient ? "" : "Admin@2025!");

    const idValid = isClient ? isContactValid(contact) : contact.includes("@");
    const canSubmit = idValid && password.length > 0;

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        loginMutation.mutate({ email: isClient ? contactValue(contact) : contact.trim(), password });
    };

    return (
        <AuthShell quote={isClient ? "Le style est une façon de dire qui vous êtes." : "Pilotez votre boutique en toute sérénité."}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: DARK }}>
                {isClient ? "Bon retour 👋" : "Connexion Admin"}
            </h1>
            <p className="mb-6" style={{ fontSize: 14, color: "rgba(81,49,2,0.55)", marginTop: 4 }}>
                {isClient
                    ? <>Pas de compte ? <Link to="/register" style={{ color: GOLD, fontWeight: 600 }}>Créer un compte</Link></>
                    : "Accédez au tableau de bord de gestion"}
            </p>

            {isClient && (
                <>
                    <GoogleButton label="Continuer avec Google" />
                    <OrSeparator />
                </>
            )}

            {loginMutation.error && (
                <div className="mb-4 p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
                    <p className="text-sm" style={{ color: "#DC2626" }}>{(loginMutation.error as Error).message}</p>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label className="block mb-1.5" style={{ fontSize: 13.5, fontWeight: 600, color: DARK }}>
                        {isClient ? "Téléphone ou Email" : "Email"}
                    </label>
                    {isClient ? (
                        <ContactField value={contact} onChange={setContact} autoFocus />
                    ) : (
                        <input value={contact} onChange={(e) => setContact(e.target.value)} type="email" autoComplete="email"
                            onFocus={fieldFocus} onBlur={(e) => fieldBlur(e)} placeholder="admin@samaboutique.com"
                            style={{ ...inputBase, paddingLeft: 14, paddingRight: 14 }} />
                    )}
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label style={{ fontSize: 13.5, fontWeight: 600, color: DARK }}>Mot de passe</label>
                        {isClient && (
                            <Link to="/forgot-password" style={{ fontSize: 12.5, color: GOLD, fontWeight: 600 }}>Mot de passe oublié ?</Link>
                        )}
                    </div>
                    <div className="relative">
                        <input value={password} onChange={(e) => setPassword(e.target.value)} type={showPwd ? "text" : "password"}
                            autoComplete="current-password" onFocus={fieldFocus} onBlur={(e) => fieldBlur(e)} placeholder="••••••••"
                            style={{ ...inputBase, paddingLeft: 14, paddingRight: 44 }} />
                        <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(81,49,2,0.40)", cursor: "pointer" }}>
                            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <div className="pt-1">
                    <PrimaryBtn type="submit" disabled={!canSubmit} loading={loginMutation.isPending}>
                        {loginMutation.isPending ? "Connexion…" : "Se connecter"}
                    </PrimaryBtn>
                </div>
            </form>

            {/* Comptes démo */}
            <div className="mt-5 p-3 rounded-xl text-center" style={{ background: "rgba(199,147,45,0.05)", border: "1px dashed rgba(199,147,45,0.25)" }}>
                <p className="text-xs font-medium mb-0.5" style={{ color: "rgba(81,49,2,0.55)" }}>Compte de test :</p>
                {isClient ? (
                    <p className="text-sm font-bold" style={{ color: DARK }}>77 000 00 00 · Client@2025!</p>
                ) : (
                    <p className="text-sm font-bold" style={{ color: DARK }}>admin@samaboutique.com · Admin@2025!</p>
                )}
            </div>
        </AuthShell>
    );
}
