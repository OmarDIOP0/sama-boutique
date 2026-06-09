import { useEffect, useState } from "react";
import { isStandalone } from "@/hooks/usePwa";

const GOLD = "#C7932D";
const CREAM = "#FFF8EE";

/**
 * Écran de démarrage de marque affiché au lancement.
 * Ne s'affiche qu'une fois par session de navigation pour ne pas gêner.
 */
export function SplashScreen() {
  const [show, setShow] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      if (sessionStorage.getItem("sama-splash-shown")) return false;
    } catch { /* ignore */ }
    // En mode app installée on l'affiche toujours au lancement
    return true;
  });
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!show) return;
    try { sessionStorage.setItem("sama-splash-shown", "1"); } catch { /* ignore */ }
    const hold = isStandalone() ? 1100 : 750;
    const t1 = window.setTimeout(() => setFading(true), hold);
    const t2 = window.setTimeout(() => setShow(false), hold + 420);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        background: `radial-gradient(circle at 50% 40%, #5E3A06 0%, #513102 55%, #3F2602 100%)`,
        opacity: fading ? 0 : 1,
        transition: "opacity 0.4s ease",
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <div style={{ animation: "pwaPop 0.6s cubic-bezier(0.16,1,0.3,1)" }} className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center"
          style={{ background: "rgba(199,147,45,0.12)", border: `2px solid rgba(199,147,45,0.45)`, boxShadow: "0 8px 40px rgba(199,147,45,0.30)" }}>
          <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic", fontWeight: 700, fontSize: 56, color: GOLD }}>S</span>
        </div>
        <p className="mt-6" style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 26, color: CREAM, letterSpacing: "0.01em" }}>
          Sama<span style={{ fontStyle: "italic", color: GOLD }}>Boutique</span>
        </p>
        <p className="mt-1.5" style={{ fontSize: 12.5, color: "rgba(255,248,238,0.55)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Boutique en ligne
        </p>
      </div>

      <div className="absolute" style={{ bottom: "calc(env(safe-area-inset-bottom,0px) + 48px)" }}>
        <div className="w-7 h-7 rounded-full" style={{ border: "2.5px solid rgba(199,147,45,0.25)", borderTopColor: GOLD, animation: "pwaSpin 0.8s linear infinite" }} />
      </div>
    </div>
  );
}
