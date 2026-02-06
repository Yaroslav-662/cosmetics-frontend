// src/features/cart/ui/CartItem.tsx

import { FC } from "react";
import { CartItem as Item } from "../model/cart.types";
import { useCartStore } from "../model/cart.store";

interface Props {
  item: Item;
}

export const CartItem: FC<Props> = ({ item }) => {
  const { increaseQty, decreaseQty, removeFromCart } = useCartStore();

  return (
    <div className="flex gap-4 border rounded-xl p-4 items-center">
      <img
        src={item.image}
        alt={item.title}
        className="w-20 h-20 object-cover rounded"
      />

      <div className="flex-1">
        <h3 className="font-semibold">{item.title}</h3>
        <p className="text-gray-500">{item.price} ₴</p>

        <div className="flex items-center gap-2 mt-2">
          <button onClick={() => decreaseQty(item.id)}>-</button>
          <span>{item.quantity}</span>
          <button onClick={() => increaseQty(item.id)}>+</button>
        </div>
      </div>

      <div className="text-right">
        <p className="font-semibold">
          {item.price * item.quantity} ₴
        </p>
        <button
          onClick={() => removeFromCart(item.id)}
          className="text-red-500 text-sm"
        >
          Видалити
        </button>
      </div>
    </div>
  );
};


