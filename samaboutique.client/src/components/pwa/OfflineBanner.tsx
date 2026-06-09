import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";

/**
 * Bandeau global d'état réseau : prévient quand la connexion est perdue,
 * et affiche brièvement un retour vert quand elle revient.
 */
export function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    const goOffline = () => { setOnline(false); setShowBack(false); };
    const goOnline = () => {
      setOnline(true);
      setShowBack(true);
      window.setTimeout(() => setShowBack(false), 2500);
    };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (online && !showBack) return null;

  const offline = !online;
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[70] flex items-center justify-center gap-2 px-4"
      style={{
        height: 36,
        paddingTop: "env(safe-area-inset-top, 0px)",
        background: offline ? "#513102" : "#2D7A4F",
        color: "#FFF8EE",
        fontSize: 13,
        fontWeight: 600,
        animation: "pwaSlideDown 0.3s ease",
      }}
    >
      {offline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
      {offline ? "Vous êtes hors ligne — certaines données peuvent être indisponibles" : "Connexion rétablie"}
    </div>
  );
}
