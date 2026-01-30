// src/features/orders/pages/RealtimeOrdersPage.tsx
import React, { useEffect } from "react";
import { MetaTags } from "@/app/seo/MetaTags";
import Card from "@/shared/ui/Card";

import { useOrders } from "@/features/orders/store/useOrders";
import { useOrderRealtime } from "@/features/orders/hooks/useOrderRealtime";
import { OrderList } from "@/features/orders/OrderList";

export default function RealtimeOrdersPage() {
  const orders = useOrders((s) => s.orders);
  const fetchOrders = useOrders((s) => s.fetchOrders);
  const loading = useOrders((s) => s.loading);
  const error = useOrders((s) => s.error);

  useOrderRealtime();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="p-6 text-white space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Замовлення (Real-time)
        </h1>
        <p className="text-xs text-neutral-400">
          Нові замовлення та зміни статусів зʼявляються миттєво через WebSocket.
        </p>
      </div>

      <OrderTable
        orders={orders}
        onChangeStatus={handleStatusChange}
      />
    </div>
  );
};

