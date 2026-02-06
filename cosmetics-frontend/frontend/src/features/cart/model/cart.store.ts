// src/features/cart/model/cart.store.ts
import { create } from "zustand";
import { CartItem, CartProduct, CartState } from "./cart.types";

const STORAGE_KEY = "cart-storage";

const loadCart = (): CartItem[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const useCartStore = create<CartState>((set, get) => ({
  items: loadCart(),

  addToCart: (product: CartProduct) =>
    set((state) => {
      const exists = state.items.find((i) => i.id === product.id);

      const items = exists
        ? state.items.map((i) =>
            i.id === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        : [...state.items, { ...product, quantity: 1 }];

      saveCart(items);
      return { items };
    }),

  removeFromCart: (id) =>
    set((state) => {
      const items = state.items.filter((i) => i.id !== id);
      saveCart(items);
      return { items };
    }),

  increaseQty: (id) =>
    set((state) => {
      const items = state.items.map((i) =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i
      );
      saveCart(items);
      return { items };
    }),

  decreaseQty: (id) =>
    set((state) => {
      const items = state.items
        .map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter((i) => i.quantity > 0);

      saveCart(items);
      return { items };
    }),

  clearCart: () => {
    saveCart([]);
    set({ items: [] });
  },

  totalPrice: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  totalItems: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),
}));

