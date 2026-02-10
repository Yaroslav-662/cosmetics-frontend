// src/features/cart/ui/CartList.tsx

import { useCartStore } from "../model/cart.store";
import { CartItem } from "./CartItem";

export const CartList = () => {
  const items = useCartStore((s) => s.items);

  if (!items.length) {
    return (
      <div className="text-center py-20 text-neutral-500">
        Cart is empty
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <CartItem key={item.id} item={item} />
      ))}
    </div>
  );
};
