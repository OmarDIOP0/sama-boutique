import { SplashScreen } from "./SplashScreen";
import { OfflineBanner } from "./OfflineBanner";
import { InstallBanner } from "./InstallBanner";

/**
 * Regroupe les éléments d'UI liés à la PWA, montés une seule fois à la racine :
 *  • écran de démarrage de marque
 *  • bandeau d'état réseau (hors ligne / reconnecté)
 *  • bannière d'installation (A2HS) + instructions iOS
 */
export function PwaChrome() {
  return (
    <>
      <SplashScreen />
      <OfflineBanner />
      <InstallBanner />
    </>
  );
}
