// src/features/cart/ui/CartList.tsx

import { CartItem } from "./CartItem";
import { useCartStore } from "../model/cart.store";

export const CartList = () => {
  const items = useCartStore((s) => s.items);

  if (!items.length) {
    return <p className="text-center">Кошик порожній 🛒</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((item) => (
        <CartItem key={item.id} item={item} />
      ))}
    </div>
  );
};


