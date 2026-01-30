// src/features/orders/store/useOrders.ts
import { create } from "zustand";
import type { Order, OrderStatus } from "@/features/orders/model/order.types";
import { OrdersApi } from "@/features/orders/api/orders.api";

export type OrdersState = {
  orders: Order[];
  loading: boolean;
  error: string | null;

  fetchOrders: () => Promise<void>;

  // realtime helpers
  setOrders: (orders: Order[]) => void;
  addOrderRealtime: (order: Order) => void;
  updateOrderRealtime: (order: Order) => void;
  updateStatusRealtime: (orderId: string, status: OrderStatus) => void;
};

export const useOrders = create<OrdersState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const orders = await OrdersApi.getOrders();

      // нормалізація (на випадок якщо бекенд колись поверне total undefined)
      const normalized = orders.map((o) => ({
        ...o,
        total: typeof o.total === "number" ? o.total : 0,
        items: Array.isArray(o.items) ? o.items : [],
      }));

      set({ orders: normalized, loading: false });
    } catch (err: any) {
      set({
        loading: false,
        error: err?.response?.data?.message || "Не вдалося завантажити замовлення",
      });
    }
  },

  setOrders: (orders) => {
    set({ orders });
  },

  addOrderRealtime: (order) => {
    const exists = get().orders.some((o) => o._id === order._id);
    if (exists) return;

    set({ orders: [order, ...get().orders] });
  },

  updateOrderRealtime: (order) => {
    set({
      orders: get().orders.map((o) => (o._id === order._id ? order : o)),
    });
  },

  updateStatusRealtime: (orderId, status) => {
    set({
      orders: get().orders.map((o) =>
        o._id === orderId ? { ...o, status } : o
      ),
    });
  },
}));
