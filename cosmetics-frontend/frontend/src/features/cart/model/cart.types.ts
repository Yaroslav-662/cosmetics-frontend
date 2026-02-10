// src/features/cart/model/cart.types.ts

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string; // ПОВНИЙ URL
  qty: number;
}

export interface AddToCartPayload {
  id: string;
  title: string;
  price: number;
  image: string;
}
