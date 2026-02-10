// src/features/cart/model/cart.store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, AddToCartPayload } from "./cart.types";

interface CartState {
  items: CartItem[];

  addItem: (payload: AddToCartPayload) => void;
  removeItem: (id: string) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  clearCart: () => void;

  totalCount: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (payload) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === payload.id);

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === payload.id
                  ? { ...i, qty: i.qty + 1 }
                  : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...payload,
                qty: 1,
              },
            ],
          };
        }),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      increaseQty: (id) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, qty: i.qty + 1 } : i
          ),
        })),

      decreaseQty: (id) =>
        set((state) => ({
          items: state.items
            .map((i) =>
              i.id === id ? { ...i, qty: i.qty - 1 } : i
            )
            .filter((i) => i.qty > 0),
        })),

      clearCart: () => set({ items: [] }),

      totalCount: () =>
        get().items.reduce((sum, i) => sum + i.qty, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, i) => sum + i.price * i.qty,
          0
        ),
    }),
    {
      name: "cart-storage", // localStorage
    }
  )
);
