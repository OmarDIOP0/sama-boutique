import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  productIds: string[];
  toggle: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  count: () => number;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],

      toggle: (productId) => {
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds.filter((id) => id !== productId)
            : [...state.productIds, productId],
        }));
      },

      isFavorite: (productId) => get().productIds.includes(productId),

      count: () => get().productIds.length,

      clear: () => set({ productIds: [] }),
    }),
    { name: "sama-wishlist", version: 1 }
  )
);
