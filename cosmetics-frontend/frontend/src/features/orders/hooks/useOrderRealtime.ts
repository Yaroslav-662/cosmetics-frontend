import { useEffect } from "react";
import { useSocket } from "@/app/providers/SocketProvider";
import { useOrders } from "@/features/orders/store/useOrders";
import type { Order } from "@/features/orders/model/order.types";

export function useOrderRealtime() {
  const { socket } = useSocket();

  const addOrderDirect = useOrders((s) => s.addOrderDirect);
  const updateOrderStatus = useOrders((s) => s.updateOrderStatus);

  useEffect(() => {
    if (!socket) return;

    const onOrdersUpdated = (payload: { orders: Order[] }) => {
      // якщо хочеш — просто replace all:
      // useOrders.setState({ items: payload.orders })
      payload.orders.forEach((o) => addOrderDirect(o));
    };

    const onStatusUpdated = (payload: { orderId: string; status: Order["status"] }) => {
      updateOrderStatus(payload.orderId, payload.status);
    };

    socket.on("orders:updated", onOrdersUpdated);
    socket.on("orderStatusUpdated", onStatusUpdated);

    return () => {
      socket.off("orders:updated", onOrdersUpdated);
      socket.off("orderStatusUpdated", onStatusUpdated);
    };
  }, [socket, addOrderDirect, updateOrderStatus]);
}
