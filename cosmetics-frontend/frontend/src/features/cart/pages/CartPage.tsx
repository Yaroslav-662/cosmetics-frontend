// src/features/cart/pages/CartPage.tsx

import { CartList } from "../ui/CartList";
import { useCartStore } from "../model/cart.store";
import { Link } from "react-router-dom";

export const CartPage = () => {
  const totalPrice = useCartStore((s) => s.totalPrice());

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-3 gap-10">
      {/* LEFT */}
      <div className="col-span-2">
        <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
        <CartList />
      </div>

      {/* RIGHT */}
      <div className="border border-neutral-200 rounded-2xl p-6 h-fit">
        <h2 className="text-lg font-semibold mb-4">Cart summary</h2>

        <div className="flex justify-between mb-2">
          <span>Subtotal</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>

        <div className="flex justify-between mb-6">
          <span>Shipping</span>
          <span>Free</span>
        </div>

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>

        <Link
          to="/checkout"
          className="block mt-6 bg-black text-white text-center py-3 rounded-xl hover:opacity-90"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
};
