// src/pages/Checkout/CheckoutPage.tsx
import React, { useMemo, useState } from "react";
import { useCart } from "@/store/cart.store";
import axios from "@/shared/api/axios";

export const CheckoutPage = () => {
  const { items, clear } = useCart();

  const total = items.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    await axios.post("/orders", {
      items,
      total,
      customer: {
        name: "Test User",
        email: "test@mail.com",
        address: "Kyiv",
      },
    });

    clear();
    alert("Order placed!");
  };

  return (
    <form
      onSubmit={submit}
      className="max-w-6xl mx-auto p-6 grid grid-cols-3 gap-8"
    >
      {/* LEFT */}
      <div className="col-span-2 space-y-4">
        <h2 className="text-xl font-bold">Billing details</h2>

        <input placeholder="Name" className="input" />
        <input placeholder="Email" className="input" />
        <input placeholder="Address" className="input" />
      </div>

      {/* RIGHT */}
      <div className="border p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Your order</h2>

        {items.map((i) => (
          <div key={i.id} className="flex justify-between">
            <span>{i.title} × {i.qty}</span>
            <span>${i.price * i.qty}</span>
          </div>
        ))}

        <hr className="my-4" />

        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <button
          type="submit"
          className="mt-6 w-full bg-black text-white py-3 rounded"
        >
          Place order
        </button>
      </div>
    </form>
  );
};

