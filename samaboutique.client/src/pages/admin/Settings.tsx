import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Settings as SettingsIcon,
  Loader2,
  Moon,
  Sun,
  Lock,
  Palette,
  Type,
  Check,
} from "lucide-react";
import { changePasswordSchema, type ChangePasswordFormData } from "@/lib/validators";
import { useChangePassword } from "@/hooks/useAuth";
import { useUIStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { PageHeader } from "@/components/shared/PageHeader";
import { cn, roleLabel } from "@/lib/utils";
import { useState, useEffect } from "react";

// ── Appearance helpers ────────────────────────────────────────────────────────
const COLOR_THEMES = [
  {
    id: "terracotta",
    label: "Terracotta",
    primary: "#C4622D",
    desc: "Chaud & authentique",
    preview: ["#C4622D", "#D4724D", "#F5E6DC"],
  },
  {
    id: "violet",
    label: "Violet",
    primary: "oklch(0.55 0.2 280)",
    desc: "Élégant & moderne",
    preview: ["oklch(0.55 0.2 280)", "oklch(0.62 0.18 280)", "oklch(0.94 0.01 280)"],
  },
  {
    id: "indigo",
    label: "Indigo",
    primary: "#3730A3",
    desc: "Sobre & professionnel",
    preview: ["#3730A3", "#4F46E5", "#EEF2FF"],
  },
] as const;

const FONT_SIZES = [
  { id: "sm", label: "Compact", size: "13px" },
  { id: "md", label: "Normal", size: "14px" },
  { id: "lg", label: "Large", size: "16px" },
] as const;

type ColorThemeId = (typeof COLOR_THEMES)[number]["id"];
type FontSizeId = (typeof FONT_SIZES)[number]["id"];

function loadAppearance() {
  try {
    return {
      colorTheme: (localStorage.getItem("sama-color-theme") as ColorThemeId) ?? "terracotta",
      fontSize: (localStorage.getItem("sama-font-size") as FontSizeId) ?? "md",
    };
  } catch {
    return { colorTheme: "terracotta" as ColorThemeId, fontSize: "md" as FontSizeId };
  }
}

function applyColorTheme(themeId: ColorThemeId) {
  const theme = COLOR_THEMES.find((t) => t.id === themeId);
  if (!theme) return;
  document.documentElement.style.setProperty("--sama-terra", theme.primary);
  document.documentElement.style.setProperty("--sidebar-primary", theme.primary);
  document.documentElement.style.setProperty("--sidebar-accent-foreground", theme.primary);
  document.documentElement.style.setProperty("--sama-terra-light", `${theme.primary}15`);
  document.documentElement.style.setProperty("--sama-terra-mid", `${theme.primary}25`);
}

function applyFontSize(sizeId: FontSizeId) {
  const size = FONT_SIZES.find((f) => f.id === sizeId);
  if (!size) return;
  document.documentElement.style.setProperty("--base-font-size", size.size);
  document.documentElement.style.fontSize = size.size;
}
// ──────────────────────────────────────────────────────────────────────────────

export default function Settings() {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const [pwSuccess, setPwSuccess] = useState(false);
  const changePasswordMutation = useChangePassword();

  const saved = loadAppearance();
  const [colorTheme, setColorTheme] = useState<ColorThemeId>(saved.colorTheme);
  const [fontSize, setFontSize] = useState<FontSizeId>(saved.fontSize);
  const [appearanceSaved, setAppearanceSaved] = useState(false);

  // Apply on mount
  useEffect(() => {
    applyColorTheme(colorTheme);
    applyFontSize(fontSize);
  }, []);

  const handleApplyAppearance = () => {
    applyColorTheme(colorTheme);
    applyFontSize(fontSize);
    localStorage.setItem("sama-color-theme", colorTheme);
    localStorage.setItem("sama-font-size", fontSize);
    setAppearanceSaved(true);
    setTimeout(() => setAppearanceSaved(false), 2500);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          reset();
          setPwSuccess(true);
          setTimeout(() => setPwSuccess(false), 3000);
        },
      }
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <PageHeader icon={SettingsIcon} title="Paramètres" description="Configuration de votre compte" />

      {/* Profile */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
          <div className="w-1 h-5 rounded-full" style={{ background: "var(--sama-terra)" }} />
          <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Profil</h3>
        </div>
        <div className="p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{ background: "var(--sama-terra-light)", border: "2px solid var(--sama-terra)", color: "var(--sama-terra)" }}>
            {user?.nom?.[0] ?? "?"}
          </div>
          <div>
            <p className="text-lg font-bold text-foreground" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {user?.nom}
            </p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-0.5 rounded-full"
              style={{ background: "var(--sama-terra-light)", color: "var(--sama-terra)" }}>
              {user ? roleLabel(user.role) : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
          <div className="w-1 h-5 rounded-full" style={{ background: "var(--sama-terra)" }} />
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            <Palette className="w-4 h-4" style={{ color: "var(--sama-terra)" }} />
            Apparence
          </h3>
        </div>
        <div className="p-5 space-y-5">

        {/* Color theme */}
        <div className="space-y-2.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Couleur principale
          </label>
          <div className="grid grid-cols-3 gap-3">
            {COLOR_THEMES.map((ct) => (
              <button
                key={ct.id}
                onClick={() => setColorTheme(ct.id)}
                className={cn(
                  "relative p-3 rounded-xl border-2 text-left transition-all",
                  colorTheme === ct.id
                    ? "border-[--sama-terra] shadow-sm"
                    : "border-border/50 hover:border-border"
                )}
              >
                {/* Color preview strip */}
                <div className="flex gap-1 mb-2">
                  {ct.preview.map((color, i) => (
                    <div
                      key={i}
                      className="h-5 rounded flex-1"
                      style={{ background: color }}
                    />
                  ))}
                </div>
                <p className="text-xs font-semibold text-foreground">{ct.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{ct.desc}</p>
                {colorTheme === ct.id && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: "var(--sama-terra)" }}>
                    <Check className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Font size */}
        <div className="space-y-2.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5" /> Taille du texte
          </label>
          <div className="flex gap-2">
            {FONT_SIZES.map((fs) => (
              <button
                key={fs.id}
                onClick={() => setFontSize(fs.id)}
                className={cn(
                  "flex-1 h-10 rounded-xl border-2 text-sm font-medium transition-all",
                  fontSize === fs.id
                    ? "border-[--sama-terra] text-[--sama-terra] bg-[--sama-terra-light]"
                    : "border-border/50 text-muted-foreground hover:border-border"
                )}
                style={{ fontSize: fs.size }}
              >
                {fs.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dark mode */}
        <div className="flex items-center justify-between py-3 border-t border-border/50">
          <div>
            <p className="text-sm font-medium">Mode sombre</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Actuellement : {theme === "light" ? "Mode clair" : "Mode sombre"}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={cn(
              "relative w-11 h-6 rounded-full transition-all duration-300",
              theme === "dark" ? "bg-[--sama-terra]" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300",
                theme === "dark" ? "translate-x-5" : "translate-x-0.5"
              )}
            />
          </button>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3 pt-2 border-t border-border/50">
          <button
            onClick={handleApplyAppearance}
            className="btn-terra"
            style={{ background: appearanceSaved ? "var(--sama-green, #2DC47A)" : "var(--sama-terra)" }}
          >
            {appearanceSaved ? <Check className="w-4 h-4" /> : <Palette className="w-4 h-4" />}
            {appearanceSaved ? "Apparence appliquée !" : "Appliquer les changements"}
          </button>
        </div>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50">
          <div className="w-1 h-5 rounded-full" style={{ background: "var(--sama-terra)" }} />
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            <Lock className="w-4 h-4" style={{ color: "var(--sama-terra)" }} />
            Changer le mot de passe
          </h3>
        </div>
        <div className="p-5 space-y-4">
          {pwSuccess && (
            <div className="p-3.5 rounded-xl bg-success/10 border border-success/20">
              <p className="text-sm font-medium text-success">✓ Mot de passe modifié avec succès !</p>
            </div>
          )}

          {changePasswordMutation.error && (
            <div className="p-3.5 rounded-xl bg-danger/8 border border-danger/20">
              <p className="text-sm text-danger">{(changePasswordMutation.error as Error).message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {[
              { name: "currentPassword" as const, label: "Mot de passe actuel" },
              { name: "newPassword" as const, label: "Nouveau mot de passe" },
              { name: "confirmNewPassword" as const, label: "Confirmer le nouveau mot de passe" },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                  {label}
                </label>
                <input
                  {...register(name)}
                  type="password"
                  className={cn("input-field", errors[name] && "border-danger/60")}
                />
                {errors[name] && <p className="mt-1.5 text-xs text-danger">{errors[name]?.message}</p>}
              </div>
            ))}
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="btn-terra disabled:opacity-50"
            >
              {changePasswordMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Changer le mot de passe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
