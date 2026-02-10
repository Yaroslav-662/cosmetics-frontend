// src/features/cart/ui/CartItem.tsx

import { CartItem as Item } from "../model/cart.types";
import { useCartStore } from "../model/cart.store";

interface Props {
  item: Item;
}

export const CartItem = ({ item }: Props) => {
  const { increaseQty, decreaseQty, removeItem } = useCartStore();

  return (
    <div className="flex gap-4 border border-neutral-200 rounded-xl p-4">
      <img
        src={item.image}
        alt={item.title}
        className="w-24 h-24 object-cover rounded-lg"
      />

      <div className="flex-1">
        <h3 className="font-semibold">{item.title}</h3>
        <p className="text-sm text-neutral-500">${item.price}</p>

        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => decreaseQty(item.id)}
            className="w-8 h-8 border rounded"
          >
            −
          </button>

          <span>{item.qty}</span>

          <button
            onClick={() => increaseQty(item.id)}
            className="w-8 h-8 border rounded"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => removeItem(item.id)}
          className="text-sm text-red-500"
        >
          Remove
        </button>

        <strong>${(item.price * item.qty).toFixed(2)}</strong>
      </div>
    </div>
  );
};
