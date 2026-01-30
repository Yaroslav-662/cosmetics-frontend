// src/features/orders/api/orders.api.ts
import { api } from "@/core/api/axios";
import type { Order } from "@/features/orders/model/order.types";

type OrdersResponse = Order[];

export const OrdersApi = {
  async getMyOrAll(): Promise<Order[]> {
    const { data } = await api.get<OrdersResponse>("/api/orders");
    return data;
  },

  async create(payload: {
    items: { product: string; quantity: number }[];
    address: string;
    paymentMethod: string;
  }) {
    const { data } = await api.post("/api/orders", payload);
    return data as { message?: string; order?: Order };
  },

  async updateStatus(orderId: string, status: string) {
    const { data } = await api.put(`/api/orders/${orderId}`, { status });
    return data;
  },
};
