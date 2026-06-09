import { useState } from "react";
import { Download, X, Share, Plus } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwa";

const GOLD = "#C7932D";
const DARK = "#513102";
const CREAM = "#FFF8EE";

export function InstallBanner() {
  const { canInstall, showIosHint, promptInstall, dismiss } = usePwaInstall();
  const [iosOpen, setIosOpen] = useState(true);

  if (!canInstall && !showIosHint) return null;

  // iOS : pas de prompt natif → instructions
  if (!canInstall && showIosHint) {
    if (!iosOpen) return null;
    return (
      <Shell onClose={() => { setIosOpen(false); dismiss(); }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: DARK }}>Installer SamaBoutique</p>
        <p className="flex flex-wrap items-center gap-1" style={{ fontSize: 12.5, color: "rgba(81,49,2,0.60)", marginTop: 3 }}>
          Appuyez sur
          <Share className="inline w-4 h-4" style={{ color: GOLD }} />
          puis « Sur l'écran d'accueil »
          <Plus className="inline w-3.5 h-3.5" style={{ color: GOLD }} />
        </p>
      </Shell>
    );
  }

  return (
    <Shell onClose={dismiss}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p style={{ fontSize: 14, fontWeight: 700, color: DARK }}>Installer l'application</p>
          <p style={{ fontSize: 12.5, color: "rgba(81,49,2,0.60)", marginTop: 2 }}>
            Accès rapide, plein écran et notifications.
          </p>
        </div>
        <button
          onClick={promptInstall}
          className="flex items-center gap-2 h-10 px-4 rounded-full flex-shrink-0 transition-transform hover:scale-[1.03]"
          style={{ background: GOLD, color: CREAM, fontSize: 13.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(199,147,45,0.40)" }}
        >
          <Download className="w-4 h-4" /> Installer
        </button>
      </div>
    </Shell>
  );
}

function Shell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed left-1/2 z-[60] w-[min(440px,calc(100vw-24px))]"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)", transform: "translateX(-50%)", animation: "pwaSlideUp 0.32s cubic-bezier(0.16,1,0.3,1)" }}
    >
      <div className="relative rounded-2xl p-4 pr-10"
        style={{ background: "rgba(255,248,238,0.97)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(199,147,45,0.30)", boxShadow: "0 16px 48px rgba(81,49,2,0.22)" }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#513102" }}>
            <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontWeight: 700, fontSize: 22, color: GOLD }}>S</span>
          </div>
          <div className="flex-1 min-w-0">{children}</div>
        </div>
        <button onClick={onClose}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: "rgba(81,49,2,0.45)", cursor: "pointer" }}
          aria-label="Fermer">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
