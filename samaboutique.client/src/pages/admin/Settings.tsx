import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Settings as SettingsIcon, Loader2, Lock, Palette, Type, Check,
  Store, CreditCard, Truck, Bell, User, Shield,
} from "lucide-react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { changePasswordSchema, type ChangePasswordFormData } from "@/lib/validators";
import { useChangePassword } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useAuthStore } from "@/stores/auth.store";
import { useSettingsStore } from "@/stores/settings.store";
import { AdminPageHeader } from "@/components/admin/ui";
import { cn, roleLabel, formatPrice } from "@/lib/utils";
import { useState, useEffect } from "react";

const GOLD = "#C7932D";
const DARK = "#513102";

// Thèmes d'accent — palette chaude uniquement (Wurus)
const COLOR_THEMES = [
  { id: "or", label: "Or ambré", primary: "#C7932D", desc: "Chaleureux & premium", preview: ["#C7932D", "#D4A574", "#FFF8EE"] },
  { id: "terracotta", label: "Terracotta", primary: "#C4622D", desc: "Chaud & authentique", preview: ["#C4622D", "#D4724D", "#F5E6DC"] },
  { id: "chocolat", label: "Chocolat", primary: "#513102", desc: "Sobre & profond", preview: ["#513102", "#7A5418", "#EDE3D2"] },
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
      colorTheme: (localStorage.getItem("sama-color-theme") as ColorThemeId) ?? "or",
      fontSize: (localStorage.getItem("sama-font-size") as FontSizeId) ?? "md",
    };
  } catch { return { colorTheme: "or" as ColorThemeId, fontSize: "md" as FontSizeId }; }
}
function applyColorTheme(id: ColorThemeId) {
  const t = COLOR_THEMES.find((x) => x.id === id); if (!t) return;
  document.documentElement.style.setProperty("--sama-terra", t.primary);
  document.documentElement.style.setProperty("--sama-terra-light", `${t.primary}15`);
}
function applyFontSize(id: FontSizeId) {
  const s = FONT_SIZES.find((x) => x.id === id); if (!s) return;
  document.documentElement.style.fontSize = s.size;
}

const SECTIONS = [
  { id: "profil", label: "Profil", icon: User },
  { id: "apparence", label: "Apparence", icon: Palette },
  { id: "paiement", label: "Paiement", icon: CreditCard },
  { id: "livraison", label: "Livraison", icon: Truck },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "securite", label: "Sécurité", icon: Shield },
] as const;

function Card({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="admin-card overflow-hidden">
      <div className="flex items-center gap-2.5 px-6 py-5" style={{ borderBottom: "1px solid rgba(81,49,2,0.06)" }}>
        <Icon className="w-5 h-5" style={{ color: GOLD }} />
        <h3 style={{ fontSize: 18, fontWeight: 700, color: DARK }}>{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", height: 50, borderRadius: 12, padding: "0 16px",
  border: "1.5px solid rgba(81,49,2,0.14)", background: "white", fontSize: 16, color: DARK, outline: "none",
};
const labelStyle: React.CSSProperties = { display: "block", fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "rgba(81,49,2,0.55)", marginBottom: 8 };

export default function Settings() {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [active, setActive] = useState<typeof SECTIONS[number]["id"]>("profil");
  const changePasswordMutation = useChangePassword();

  const saved = loadAppearance();
  const [colorTheme, setColorTheme] = useState<ColorThemeId>(saved.colorTheme);
  const [fontSize, setFontSize] = useState<FontSizeId>(saved.fontSize);

  // Zones de livraison (store persisté)
  const { zones, freeDeliveryThreshold, setZoneFee, setZoneDelai, addZone, removeZone, setFreeThreshold } = useSettingsStore();
  const [newZoneNom, setNewZoneNom] = useState("");
  const [newZoneFee, setNewZoneFee] = useState(2000);

  useEffect(() => { applyColorTheme(colorTheme); applyFontSize(fontSize); }, []);

  const handleApplyAppearance = () => {
    applyColorTheme(colorTheme); applyFontSize(fontSize);
    localStorage.setItem("sama-color-theme", colorTheme);
    localStorage.setItem("sama-font-size", fontSize);
    toast.success("Apparence appliquée");
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    changePasswordMutation.mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      { onSuccess: () => { reset(); toast.success("Mot de passe modifié"); }, onError: (e) => toast.error((e as Error).message) }
    );
  };

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-[1200px]">
      <AdminPageHeader icon={SettingsIcon} title="Paramètres" subtitle="Configuration de la boutique et du compte" />

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Sub-nav */}
        <nav className="admin-card p-2 h-fit">
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setActive(s.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors mb-0.5"
              style={active === s.id
                ? { background: "rgba(199,147,45,0.12)", color: GOLD, fontSize: 14, fontWeight: 600, cursor: "pointer" }
                : { color: "rgba(81,49,2,0.65)", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
              <s.icon className="w-4 h-4 flex-shrink-0" />
              {s.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="space-y-5">
          {/* ── Profil ── */}
          {active === "profil" && (
            <Card title="Profil" icon={User}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(199,147,45,0.12)", border: `2px solid ${GOLD}`, color: GOLD, fontSize: 26, fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
                  {user?.nom?.[0] ?? "?"}
                </div>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: DARK, fontFamily: "'Playfair Display', serif" }}>{user?.nom}</p>
                  <p style={{ fontSize: 14, color: "rgba(81,49,2,0.55)" }}>{user?.email}</p>
                  <span className="inline-flex mt-1.5 admin-badge admin-badge-warning">{user ? roleLabel(user.role) : ""}</span>
                </div>
              </div>
            </Card>
          )}

          {/* ── Apparence ── */}
          {active === "apparence" && (
            <Card title="Apparence" icon={Palette}>
              <div className="space-y-5">
                <div>
                  <label style={labelStyle}>Couleur d'accent</label>
                  <div className="grid grid-cols-3 gap-3">
                    {COLOR_THEMES.map((ct) => (
                      <button key={ct.id} onClick={() => setColorTheme(ct.id)}
                        className="relative p-3 rounded-xl text-left transition-all"
                        style={{ border: colorTheme === ct.id ? `2px solid ${GOLD}` : "1.5px solid rgba(81,49,2,0.12)", cursor: "pointer" }}>
                        <div className="flex gap-1 mb-2">
                          {ct.preview.map((c, i) => <div key={i} className="h-5 rounded flex-1" style={{ background: c }} />)}
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: DARK }}>{ct.label}</p>
                        <p style={{ fontSize: 11, color: "rgba(81,49,2,0.50)" }}>{ct.desc}</p>
                        {colorTheme === ct.id && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: GOLD }}>
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}><Type className="w-3.5 h-3.5 inline mr-1" /> Taille du texte</label>
                  <div className="flex gap-2">
                    {FONT_SIZES.map((fs) => (
                      <button key={fs.id} onClick={() => setFontSize(fs.id)} className="flex-1 h-10 rounded-xl transition-all"
                        style={fontSize === fs.id
                          ? { border: `2px solid ${GOLD}`, color: GOLD, background: "rgba(199,147,45,0.08)", fontSize: fs.size, fontWeight: 600, cursor: "pointer" }
                          : { border: "1.5px solid rgba(81,49,2,0.12)", color: "rgba(81,49,2,0.55)", fontSize: fs.size, cursor: "pointer" }}>
                        {fs.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between py-3" style={{ borderTop: "1px solid rgba(81,49,2,0.06)" }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: DARK }}>Mode sombre</p>
                    <p style={{ fontSize: 12.5, color: "rgba(81,49,2,0.50)" }}>Actuellement : {theme === "light" ? "clair" : "sombre"}</p>
                  </div>
                  <button onClick={toggleTheme} className="relative w-11 h-6 rounded-full transition-all" style={{ background: theme === "dark" ? GOLD : "rgba(81,49,2,0.15)", cursor: "pointer" }}>
                    <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform", theme === "dark" ? "translate-x-5" : "translate-x-0.5")} />
                  </button>
                </div>

                <button onClick={handleApplyAppearance} className="admin-btn-gold">
                  <Palette className="w-4 h-4" /> Appliquer les changements
                </button>
              </div>
            </Card>
          )}

          {/* ── Paiement ── */}
          {active === "paiement" && (
            <Card title="Moyens de paiement" icon={CreditCard}>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "rgba(27,111,238,0.05)", border: "1.5px solid rgba(27,111,238,0.25)" }}>
                  <div className="flex items-center gap-3">
                    <img src="/wave.png" alt="Wave" className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: DARK }}>Wave Mobile Money</p>
                      <p style={{ fontSize: 12.5, color: "rgba(81,49,2,0.50)" }}>Actif · Paiement instantané</p>
                    </div>
                  </div>
                  <span className="admin-badge admin-badge-success"><Check className="w-3 h-3" /> Activé</span>
                </div>
                {["Orange Money", "Free Money", "Carte bancaire"].map((m) => (
                  <div key={m} className="flex items-center justify-between p-4 rounded-xl opacity-60" style={{ background: "rgba(81,49,2,0.03)", border: "1px solid rgba(81,49,2,0.08)" }}>
                    <p style={{ fontSize: 14, fontWeight: 500, color: DARK }}>{m}</p>
                    <span className="admin-badge admin-badge-muted">Bientôt</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ── Livraison (éditable) ── */}
          {active === "livraison" && (
            <Card title="Zones de livraison" icon={Truck}>
              <p style={{ fontSize: 14, color: "rgba(81,49,2,0.55)", marginBottom: 16 }}>
                Configurez les lieux de livraison et leurs tarifs. Ces frais s'appliquent automatiquement au paiement client.
              </p>
              <div className="space-y-2.5">
                {zones.map((z) => (
                  <div key={z.id} className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(81,49,2,0.06)" }}>
                    <Truck className="w-5 h-5 flex-shrink-0" style={{ color: GOLD }} />
                    <span className="flex-1 min-w-0 truncate" style={{ fontSize: 15, fontWeight: 600, color: DARK }}>{z.nom}</span>
                    {/* Délai */}
                    <input
                      value={z.delai}
                      onChange={(e) => setZoneDelai(z.id, e.target.value)}
                      className="text-center outline-none"
                      style={{ width: 80, height: 40, borderRadius: 10, border: "1.5px solid rgba(81,49,2,0.12)", fontSize: 14, color: "rgba(81,49,2,0.65)" }}
                      placeholder="24h"
                    />
                    {/* Frais */}
                    <div className="flex items-center gap-1">
                      <input
                        type="number" min={0} step={500}
                        value={z.fee}
                        onChange={(e) => setZoneFee(z.id, Number(e.target.value))}
                        className="text-right outline-none"
                        style={{ width: 90, height: 40, borderRadius: 10, border: `1.5px solid ${GOLD}40`, fontSize: 15, fontWeight: 700, color: GOLD, paddingRight: 8 }}
                      />
                      <span style={{ fontSize: 13, color: "rgba(81,49,2,0.45)" }}>F</span>
                    </div>
                    <button onClick={() => removeZone(z.id)} aria-label="Supprimer"
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                      style={{ color: "rgba(81,49,2,0.45)", cursor: "pointer" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.10)"; (e.currentTarget as HTMLElement).style.color = "#DC2626"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(81,49,2,0.45)"; }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Ajouter une zone */}
              <div className="flex flex-wrap items-center gap-2 mt-4 p-3.5 rounded-xl" style={{ background: "rgba(199,147,45,0.05)", border: "1px dashed rgba(199,147,45,0.30)" }}>
                <input value={newZoneNom} onChange={(e) => setNewZoneNom(e.target.value)} placeholder="Nouvelle zone (ex: Kaolack)"
                  className="flex-1 min-w-40 outline-none" style={{ height: 42, borderRadius: 10, border: "1.5px solid rgba(81,49,2,0.12)", padding: "0 12px", fontSize: 15, color: DARK }} />
                <input type="number" min={0} step={500} value={newZoneFee} onChange={(e) => setNewZoneFee(Number(e.target.value))} placeholder="Frais"
                  className="outline-none text-right" style={{ width: 100, height: 42, borderRadius: 10, border: "1.5px solid rgba(81,49,2,0.12)", padding: "0 10px", fontSize: 15, color: DARK }} />
                <button onClick={() => {
                  if (newZoneNom.trim().length < 2) { toast.error("Nom de zone requis"); return; }
                  addZone({ nom: newZoneNom.trim(), fee: newZoneFee, delai: "48h" });
                  setNewZoneNom(""); setNewZoneFee(2000); toast.success("Zone ajoutée");
                }} className="admin-btn-gold" style={{ height: 42 }}>
                  <Plus className="w-4 h-4" /> Ajouter
                </button>
              </div>

              {/* Livraison gratuite */}
              <div className="flex items-center justify-between gap-3 p-4 rounded-xl mt-4" style={{ background: "rgba(45,122,79,0.05)", border: "1px solid rgba(45,122,79,0.15)" }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 15, fontWeight: 600, color: DARK }}>🎁 Livraison gratuite dès</span>
                  <input type="number" min={0} step={5000} value={freeDeliveryThreshold}
                    onChange={(e) => setFreeThreshold(Number(e.target.value))}
                    className="text-right outline-none" style={{ width: 110, height: 40, borderRadius: 10, border: "1.5px solid rgba(45,122,79,0.30)", fontSize: 15, fontWeight: 700, color: "#2D7A4F", paddingRight: 8 }} />
                  <span style={{ fontSize: 14, color: "rgba(81,49,2,0.55)" }}>F CFA</span>
                </div>
                <span style={{ fontSize: 13, color: "rgba(81,49,2,0.45)" }}>{freeDeliveryThreshold > 0 ? formatPrice(freeDeliveryThreshold) : "Désactivé"}</span>
              </div>

              <p style={{ fontSize: 12.5, color: "rgba(81,49,2,0.45)", marginTop: 12 }}>
                💾 Les modifications sont enregistrées automatiquement.
              </p>
            </Card>
          )}

          {/* ── Notifications ── */}
          {active === "notifications" && (
            <Card title="Notifications" icon={Bell}>
              <div className="space-y-1">
                {[
                  { label: "Nouvelle commande", desc: "Recevoir une alerte à chaque commande", on: true },
                  { label: "Stock faible", desc: "Alerte quand un produit passe sous le seuil", on: true },
                  { label: "Commande abandonnée", desc: "Rappel des paniers non finalisés", on: false },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid rgba(81,49,2,0.05)" }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: DARK }}>{n.label}</p>
                      <p style={{ fontSize: 12.5, color: "rgba(81,49,2,0.50)" }}>{n.desc}</p>
                    </div>
                    <div className="relative w-11 h-6 rounded-full" style={{ background: n.on ? GOLD : "rgba(81,49,2,0.15)" }}>
                      <span className={cn("absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform", n.on ? "translate-x-5" : "translate-x-0.5")} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ── Sécurité ── */}
          {active === "securite" && (
            <Card title="Changer le mot de passe" icon={Lock}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {[
                  { name: "currentPassword" as const, label: "Mot de passe actuel" },
                  { name: "newPassword" as const, label: "Nouveau mot de passe" },
                  { name: "confirmNewPassword" as const, label: "Confirmer le nouveau mot de passe" },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <label style={labelStyle}>{label}</label>
                    <input {...register(name)} type="password" style={{ ...inputStyle, borderColor: errors[name] ? "#EF4444" : "rgba(81,49,2,0.14)" }} />
                    {errors[name] && <p className="mt-1.5" style={{ fontSize: 12, color: "#DC2626" }}>{errors[name]?.message}</p>}
                  </div>
                ))}
                <button type="submit" disabled={changePasswordMutation.isPending} className="admin-btn-gold">
                  {changePasswordMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Changer le mot de passe
                </button>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
