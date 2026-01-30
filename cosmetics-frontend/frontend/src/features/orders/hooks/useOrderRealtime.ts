// src/features/orders/hooks/useOrderRealtime.ts
import { useEffect } from "react";
import { useSocket } from "@/app/providers/SocketProvider";

import { useOrders } from "@/features/orders/store/useOrders";
import type { Order, OrderStatus } from "@/features/orders/model/order.types";

export function useOrderRealtime() {
  const { socket } = useSocket();

  const setOrders = useOrders((s) => s.setOrders);
  const updateStatusRealtime = useOrders((s) => s.updateStatusRealtime);

  useEffect(() => {
    if (!socket) return;

    const onOrdersUpdated = (payload: { orders: Order[] }) => {
      setOrders(payload.orders);
    };

    const onStatusUpdated = (payload: { orderId: string; status: OrderStatus }) => {
      updateStatusRealtime(payload.orderId, payload.status);
    };

    socket.on("orders:updated", onOrdersUpdated);
    socket.on("orderStatusUpdated", onStatusUpdated);

    return () => {
      socket.off("orders:updated", onOrdersUpdated);
      socket.off("orderStatusUpdated", onStatusUpdated);
    };
  }, [socket, setOrders, updateStatusRealtime]);
}
