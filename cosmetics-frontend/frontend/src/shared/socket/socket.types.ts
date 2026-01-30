// src/shared/socket/socket.types.ts
export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type Order = {
  _id: string;
  user?: string;
  items: Array<{ product: string; quantity: number }>;
  address?: string;
  paymentMethod?: "card" | "cash" | "paypal" | string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt?: string;
};

export type OrdersUpdatedPayload = {
  orders: Order[];
};

export type OrderStatusUpdatedPayload = {
  orderId: string;
  status: OrderStatus;
};

export type ServerToClientEvents = {
  "orders:updated": (payload: OrdersUpdatedPayload) => void;
  "orderStatusUpdated": (payload: OrderStatusUpdatedPayload) => void;

  // (якщо маєш інші — додаси)
};

export type ClientToServerEvents = {
  "order:updateStatus": (payload: { orderId: string; status: OrderStatus }) => void;
};

export type SocketData = {
  user?: { id: string; role: "admin" | "user" };
};
