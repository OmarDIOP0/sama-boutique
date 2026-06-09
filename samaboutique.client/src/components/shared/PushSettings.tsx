import { useState } from "react";
import { Bell, BellOff, Send, Loader2, ShoppingBag, Tag, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { usePush } from "@/hooks/usePush";
import type { PushPreferences } from "@/types";

const GOLD = "#C7932D";
const DARK = "#513102";

type Cat = "notifyOrders" | "notifyPromotions" | "notifyStock";
type Prefs = Omit<PushPreferences, "subscribed">;

interface CatDef {
  key: Cat;
  icon: typeof ShoppingBag;
  title: string;
  desc: string;
}

const CLIENT_CATS: CatDef[] = [
  { key: "notifyOrders", icon: ShoppingBag, title: "Suivi de commandes", desc: "Confirmation, expédition et livraison" },
  { key: "notifyPromotions", icon: Tag, title: "Promotions & nouveautés", desc: "Offres et réductions à ne pas manquer" },
];

const ADMIN_CATS: CatDef[] = [
  { key: "notifyOrders", icon: ShoppingBag, title: "Nouvelles commandes", desc: "Quand un client passe commande" },
  { key: "notifyStock", icon: AlertTriangle, title: "Alertes de stock", desc: "Stock bas ou rupture après une vente" },
];

function Switch({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="relative rounded-full transition-all flex-shrink-0 disabled:opacity-40"
      style={{ width: 44, height: 24, background: on ? GOLD : "rgba(81,49,2,0.18)", cursor: disabled ? "not-allowed" : "pointer" }}
      aria-pressed={on}
    >
      <span className="absolute top-0.5 rounded-full bg-white shadow transition-all"
        style={{ width: 20, height: 20, left: on ? 22 : 2 }} />
    </button>
  );
}

export function PushSettings({ variant = "client" }: { variant?: "client" | "admin" }) {
  const push = usePush();
  const [busy, setBusy] = useState(false);
  const cats = variant === "admin" ? ADMIN_CATS : CLIENT_CATS;

  if (!push.supported) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-2xl" style={{ background: "rgba(81,49,2,0.04)" }}>
        <BellOff className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "rgba(81,49,2,0.45)" }} />
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: DARK }}>Notifications non disponibles</p>
          <p style={{ fontSize: 13, color: "rgba(81,49,2,0.55)", marginTop: 2 }}>
            Votre navigateur ne supporte pas les notifications push.
          </p>
        </div>
      </div>
    );
  }

  const denied = push.permission === "denied";

  const toggleMaster = async () => {
    setBusy(true);
    try {
      if (push.subscribed) {
        await push.unsubscribe();
        toast.success("Notifications désactivées");
      } else {
        const ok = await push.subscribe();
        if (ok) toast.success("Notifications activées 🔔");
        else if (Notification.permission === "denied")
          toast.error("Notifications bloquées dans le navigateur");
        else toast.error("Activation impossible");
      }
    } finally {
      setBusy(false);
    }
  };

  const toggleCat = async (key: Cat) => {
    const next: Prefs = { ...push.prefs, [key]: !push.prefs[key] };
    await push.savePreferences(next);
  };

  const handleTest = async () => {
    try {
      await push.sendTest();
      toast.success("Notification de test envoyée");
    } catch {
      toast.error("Échec de l'envoi");
    }
  };

  return (
    <div className="space-y-4">
      {/* Master */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: push.subscribed ? "rgba(199,147,45,0.14)" : "rgba(81,49,2,0.06)" }}>
            <Bell className="w-5 h-5" style={{ color: push.subscribed ? GOLD : "rgba(81,49,2,0.45)" }} />
          </div>
          <div className="min-w-0">
            <p style={{ fontSize: 15, fontWeight: 700, color: DARK }}>Notifications push</p>
            <p style={{ fontSize: 13, color: "rgba(81,49,2,0.55)" }}>
              {push.subscribed ? "Activées sur cet appareil" : "Recevez des alertes en temps réel"}
            </p>
          </div>
        </div>
        {busy || push.loading
          ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: GOLD }} />
          : <Switch on={push.subscribed} onClick={toggleMaster} disabled={denied} />}
      </div>

      {denied && (
        <div className="p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.18)" }}>
          <p style={{ fontSize: 12.5, color: "#DC2626" }}>
            Les notifications sont bloquées. Autorisez-les dans les paramètres du navigateur (cadenas dans la barre d'adresse).
          </p>
        </div>
      )}

      {/* Catégories */}
      {push.subscribed && (
        <div className="space-y-1 pt-1">
          {cats.map(({ key, icon: Icon, title, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4 py-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <Icon className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(81,49,2,0.50)" }} />
                <div className="min-w-0">
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: DARK }}>{title}</p>
                  <p style={{ fontSize: 12, color: "rgba(81,49,2,0.50)" }}>{desc}</p>
                </div>
              </div>
              <Switch on={push.prefs[key]} onClick={() => toggleCat(key)} />
            </div>
          ))}

          <button
            onClick={handleTest}
            className="mt-2 inline-flex items-center gap-2 h-9 px-4 rounded-full transition-colors"
            style={{ background: "rgba(199,147,45,0.10)", color: GOLD, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            <Send className="w-3.5 h-3.5" /> Envoyer un test
          </button>
        </div>
      )}
    </div>
  );
}
