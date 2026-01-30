import { create } from "zustand";
import { OrdersApi, type Order, type OrderStatus } from "@/features/orders/api/orders.api";

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;

  fetchOrders: () => Promise<void>;
  updateStatus: (id: string, status: OrderStatus) => Promise<boolean>;

  // WS helper
  upsertOrder: (order: Order) => void;
}

export const useOrders = create<OrdersState>((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const orders = await OrdersApi.getOrders();
      set({ orders, loading: false });
    } catch (e: any) {
      set({ error: e?.response?.data?.message || "Не вдалося завантажити замовлення.", loading: false });
    }
  },

  updateStatus: async (id, status) => {
    try {
      const updated = await OrdersApi.updateStatus(id, status);
      // бекенд може повертати updated order або message — тому робимо обережно
      const list = get().orders.map((o) => (o._id === id ? { ...o, ...(updated?._id ? updated : { status }) } : o));
      set({ orders: list });
      return true;
    } catch {
      return false;
    }
  },

  upsertOrder: (order) => {
    const current = get().orders;
    const idx = current.findIndex((o) => o._id === order._id);
    if (idx === -1) set({ orders: [order, ...current] });
    else {
      const copy = [...current];
      copy[idx] = { ...copy[idx], ...order };
      set({ orders: copy });
    }
  },
}));