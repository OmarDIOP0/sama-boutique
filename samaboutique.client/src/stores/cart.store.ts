import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";

interface CartState {
  items: CartItem[];
  clientId: string | null;    // Guid
  clientNom: string | null;
  remiseGlobale: number;
  modePaiement: string;
  montantRecu: number;

  // Computed
  total: () => number;
  totalItems: () => number;
  subtotal: () => number;
  totalAfterDiscount: () => number;

  // Actions
  addItem: (item: CartItem) => void;
  updateQuantity: (variantId: string, quantite: number) => void;
  updateRemise: (variantId: string, remise: number) => void;
  removeItem: (variantId: string) => void;
  setClient: (id: string | null, nom: string | null) => void;
  setRemiseGlobale: (remise: number) => void;
  setModePaiement: (mode: string) => void;
  setMontantRecu: (montant: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      clientId: null,
      clientNom: null,
      remiseGlobale: 0,
      modePaiement: "Especes",
      montantRecu: 0,

      subtotal: () => {
        const { items } = get();
        return items.reduce(
          (acc, item) =>
            acc + item.prixUnitaire * item.quantite * (1 - item.remise / 100),
          0
        );
      },

      totalAfterDiscount: () => {
        const { remiseGlobale } = get();
        const sub = get().subtotal();
        return sub * (1 - remiseGlobale / 100);
      },

      total: () => get().totalAfterDiscount(),

      totalItems: () => {
        return get().items.reduce((acc, item) => acc + item.quantite, 0);
      },

      addItem: (newItem) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.variantId === newItem.variantId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.variantId === newItem.variantId
                  ? {
                      ...i,
                      quantite: i.quantite + newItem.quantite,
                      // Always refresh price in case it was 0 or product price changed
                      prixUnitaire: newItem.prixUnitaire > 0 ? newItem.prixUnitaire : i.prixUnitaire,
                    }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },

      updateQuantity: (variantId, quantite) => {
        if (quantite <= 0) {
          get().removeItem(variantId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId ? { ...i, quantite } : i
          ),
        }));
      },

      updateRemise: (variantId, remise) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.variantId === variantId
              ? { ...i, remise: Math.min(100, Math.max(0, remise)) }
              : i
          ),
        }));
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }));
      },

      setClient: (id, nom) => set({ clientId: id, clientNom: nom }),

      setRemiseGlobale: (remise) =>
        set({ remiseGlobale: Math.min(100, Math.max(0, remise)) }),

      setModePaiement: (mode) => set({ modePaiement: mode }),

      setMontantRecu: (montant) => set({ montantRecu: montant }),

      clearCart: () =>
        set({
          items: [],
          clientId: null,
          clientNom: null,
          remiseGlobale: 0,
          modePaiement: "Especes",
          montantRecu: 0,
        }),
    }),
    {
      name: "pos-cart",
      version: 2,   // bump version to clear any stale cart with prix=0
      migrate: () => ({
        items: [],
        clientId: null,
        clientNom: null,
        remiseGlobale: 0,
        modePaiement: "Especes",
        montantRecu: 0,
      }),
    }
  )
);
