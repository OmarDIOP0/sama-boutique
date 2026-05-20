import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Store, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { registerSchema, type RegisterFormData } from "@/lib/validators";
import { useRegister } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = ({ confirmPassword: _, ...data }: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Panneau gauche décoratif — caché mobile ──────────────────── */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative flex-col justify-between p-12"
        style={{ background: "linear-gradient(160deg, #2A1A0F 0%, #1A0E08 50%, #0F0C0A 100%)" }}
      >
        {/* Pattern points */}
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle, rgba(184,77,34,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }} />

        {/* Cercle décoratif */}
        <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #B84D22 0%, transparent 70%)" }} />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif text-xl font-bold text-white"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            SamaBoutique
          </span>
        </div>

        {/* Quote centrale */}
        <div className="relative space-y-4">
          <div className="w-10 h-0.5 bg-primary/60" />
          <p className="font-serif text-3xl font-normal leading-snug text-white"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            "La mode passe, le style reste."
          </p>
          <p className="text-sm" style={{ color: "rgba(245,240,234,0.5)" }}>
            — Coco Chanel
          </p>
        </div>

        {/* Bottom text */}
        <p className="relative text-xs" style={{ color: "rgba(245,240,234,0.3)" }}>
          © {new Date().getFullYear()} SamaBoutique · Dakar, Sénégal 🇸🇳
        </p>
      </div>

      {/* ── Panneau droit — formulaire ───────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px] space-y-7">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 justify-center">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl">SamaBoutique</span>
          </div>

          {/* Header */}
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Créer un compte
            </h1>
            <p className="text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Se connecter
              </Link>
            </p>
          </div>

          {/* Bouton Google */}
          <button
            type="button"
            onClick={() => { window.location.href = "https://localhost:7088/api/auth/google"; }}
            className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-input bg-background hover:bg-muted transition-colors text-sm font-medium"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.31z"/>
            </svg>
            S'inscrire avec Google
          </button>

          {/* Séparateur */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-background text-xs text-muted-foreground">ou par email</span>
            </div>
          </div>

          {/* Erreur mutation */}
          {registerMutation.error && (
            <div className="p-3 rounded-xl bg-danger/10 border border-danger/20">
              <p className="text-sm text-danger">
                {(registerMutation.error as Error).message}
              </p>
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: "nom" as const, label: "Nom complet", type: "text", placeholder: "Jean Dupont" },
              { name: "email" as const, label: "Email", type: "email", placeholder: "vous@exemple.com" },
              { name: "telephone" as const, label: "Téléphone (optionnel)", type: "tel", placeholder: "+221 77 000 00 00" },
            ].map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
                <input
                  {...register(name)}
                  type={type}
                  className={cn(
                    "w-full h-10 px-3.5 rounded-xl border bg-background text-sm outline-none transition-colors",
                    "focus:border-primary focus:ring-2 focus:ring-primary/20",
                    errors[name]
                      ? "border-danger/60 focus:border-danger"
                      : "border-input"
                  )}
                  placeholder={placeholder}
                />
                {errors[name] && (
                  <p className="mt-1 text-xs text-danger">{errors[name]?.message}</p>
                )}
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className={cn(
                    "w-full h-10 pl-3.5 pr-10 rounded-xl border bg-background text-sm outline-none transition-colors",
                    "focus:border-primary focus:ring-2 focus:ring-primary/20",
                    errors.password ? "border-danger/60" : "border-input"
                  )}
                  placeholder="Min. 8 caractères"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-danger">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Confirmer le mot de passe</label>
              <input
                {...register("confirmPassword")}
                type="password"
                className={cn(
                  "w-full h-10 px-3.5 rounded-xl border bg-background text-sm outline-none transition-colors",
                  "focus:border-primary focus:ring-2 focus:ring-primary/20",
                  errors.confirmPassword ? "border-danger/60" : "border-input"
                )}
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-danger">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 btn-lift disabled:opacity-50 mt-2"
            >
              {registerMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {registerMutation.isPending ? "Inscription…" : "Créer mon compte"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
