import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface DeliveryZone {
  id: string;
  nom: string;       // ex: "Dakar", "Thiès"
  fee: number;       // frais en FCFA
  delai: string;     // ex: "24h", "48h"
}

// Zones par défaut (les 14 régions du Sénégal regroupées)
const DEFAULT_ZONES: DeliveryZone[] = [
  { id: "dakar",       nom: "Dakar",                      fee: 1000, delai: "24h" },
  { id: "banlieue",    nom: "Banlieue (Pikine, Guédiawaye, Rufisque)", fee: 1500, delai: "24-48h" },
  { id: "thies",       nom: "Thiès / Mbour",              fee: 2000, delai: "48h" },
  { id: "diourbel",    nom: "Diourbel / Touba",           fee: 2000, delai: "48h" },
  { id: "saint-louis", nom: "Saint-Louis",                fee: 3500, delai: "2-3 j" },
  { id: "regions",     nom: "Autres régions",             fee: 4000, delai: "2-4 j" },
];

interface SettingsState {
  zones: DeliveryZone[];
  freeDeliveryThreshold: number;   // livraison gratuite au-dessus de ce montant (0 = désactivé)
  setZoneFee: (id: string, fee: number) => void;
  setZoneDelai: (id: string, delai: string) => void;
  addZone: (zone: Omit<DeliveryZone, "id">) => void;
  removeZone: (id: string) => void;
  setFreeThreshold: (v: number) => void;
  resetZones: () => void;
  feeFor: (zoneNom: string) => number;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      zones: DEFAULT_ZONES,
      freeDeliveryThreshold: 50000,

      setZoneFee: (id, fee) =>
        set((s) => ({ zones: s.zones.map((z) => (z.id === id ? { ...z, fee } : z)) })),
      setZoneDelai: (id, delai) =>
        set((s) => ({ zones: s.zones.map((z) => (z.id === id ? { ...z, delai } : z)) })),
      addZone: (zone) =>
        set((s) => ({ zones: [...s.zones, { ...zone, id: `z-${Date.now()}` }] })),
      removeZone: (id) =>
        set((s) => ({ zones: s.zones.filter((z) => z.id !== id) })),
      setFreeThreshold: (v) => set({ freeDeliveryThreshold: v }),
      resetZones: () => set({ zones: DEFAULT_ZONES }),

      // Retourne le frais pour une zone : match direct → "Autres régions" → 1ère zone
      feeFor: (zoneNom) => {
        const zones = get().zones;
        const n = zoneNom.toLowerCase();
        const direct = zones.find((x) => x.nom.toLowerCase().includes(n) || n.includes(x.nom.toLowerCase().split(" ")[0]));
        if (direct) return direct.fee;
        const autres = zones.find((x) => /autre|région|region/i.test(x.nom));
        return autres?.fee ?? zones[0]?.fee ?? 1000;
      },
    }),
    { name: "sama-settings", version: 1 }
  )
);
