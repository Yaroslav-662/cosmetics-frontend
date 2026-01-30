// src/features/orders/model/order.types.ts
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  product: string;
  quantity: number;
};

export type Order = {
  _id: string;
  items: OrderItem[];
  address?: string;
  paymentMethod?: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt?: string;
};
