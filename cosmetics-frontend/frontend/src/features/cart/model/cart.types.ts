// src/features/cart/model/cart.types.ts

import type { Product } from "@/features/products/model/product.types";

export interface CartProduct {
  id: string;
  title: string;
  price: number;
  image: string;
}

export interface CartItem extends CartProduct {
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: string) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  clearCart: () => void;
  totalPrice: () => number;
  totalItems: () => number;
}


