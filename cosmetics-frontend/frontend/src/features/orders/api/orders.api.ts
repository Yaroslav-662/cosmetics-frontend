import { api } from "@/core/api/axios";

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export type OrderItem = {
  product: any; // може бути id або populated object
  quantity: number;
};

export type Order = {
  _id: string;
  user?: any;
  items: OrderItem[];
  total?: number;
  status: OrderStatus;
  address: string;
  paymentMethod: "card" | "cash";
  createdAt: string;
};

export const OrdersApi = {
  async getOrders(): Promise<Order[]> {
    const { data } = await api.get("/api/orders");
    return data;
  },

  async updateStatus(id: string, status: OrderStatus) {
    const { data } = await api.put(`/api/orders/${id}`, { status });
    return data;
  },
};