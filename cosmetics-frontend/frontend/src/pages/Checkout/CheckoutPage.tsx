// src/pages/Checkout/CheckoutPage.tsx
import React, { useMemo, useState } from "react";
import { MetaTags } from "@/app/seo/MetaTags";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { api } from "@/core/api/axios";
import Input from "@/shared/ui/Input";
import Select from "@/shared/ui/Select";
import Button from "@/shared/ui/Button";
import { NavLink, useNavigate } from "react-router-dom";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const cart = useCartStore();

  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [loading, setLoading] = useState(false);

  const canOrder = !!user; // за Swagger orders — авторизований

  const itemsPayload = useMemo(
    () => cart.items.map((i) => ({ product: i._id, quantity: i.quantity })),
    [cart.items]
  );

  async function createOrder() {
    if (!canOrder) return;
    const a = address.trim();
    if (!a) return alert("Введіть адресу доставки");
    if (!itemsPayload.length) return alert("Кошик порожній");

    setLoading(true);
    try {
      await api.post("/api/orders", {
        items: itemsPayload,
        address: a,
        paymentMethod,
      });

      cart.clear();
      navigate("/orders");
    } catch (e: any) {
      alert(e?.response?.data?.message || "Не вдалося створити замовлення.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <MetaTags title="Checkout" />

      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gold-300">Checkout</h1>
          <p className="text-sm text-neutral-400">Оформлення замовлення через /api/orders.</p>
        </div>

        {!canOrder ? (
          <div className="border border-neutral-800 bg-neutral-900/60 rounded-2xl p-6">
            <div className="text-neutral-300 mb-3">Увійдіть, щоб оформити замовлення.</div>
            <NavLink to="/auth/login" className="inline-block">
              <Button>Увійти</Button>
            </NavLink>
          </div>
        ) : (
          <>
            {/* ORDER SUMMARY */}
            <div className="border border-neutral-800 bg-neutral-900/60 rounded-2xl p-6">
              <div className="font-semibold text-white mb-4">Ваше замовлення</div>

              {cart.items.length === 0 ? (
                <div className="text-neutral-400">Кошик порожній.</div>
              ) : (
                <div className="space-y-3">
                  {cart.items.map((i) => (
                    <div key={i._id} className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={i.image || "https://placehold.co/64x64?text=Img"}
                          alt={i.name}
                          className="w-12 h-12 rounded-xl object-cover border border-neutral-800"
                        />

                        <div>
                          <div className="text-neutral-100 text-sm font-semibold">{i.name}</div>
                          <div className="text-neutral-400 text-xs">
                            {i.quantity} × {i.price} ₴
                          </div>
                        </div>
                      </div>
                      <div className="text-white font-semibold">{i.price * i.quantity} ₴</div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                    <div className="text-neutral-300">Разом</div>
                    <div className="text-white text-xl font-bold">{cart.total} ₴</div>
                  </div>
                </div>
              )}
            </div>

            {/* SHIPPING + PAYMENT */}
            <div className="border border-neutral-800 bg-neutral-900/60 rounded-2xl p-6 space-y-4">
              <div className="font-semibold text-white">Доставка</div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">Адреса</label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Місто, вулиця, будинок…" />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">Оплата</label>
                <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)}>
                  <option value="card">Карткою</option>
                  <option value="cash">Готівкою</option>
                </Select>
              </div>

              <Button onClick={createOrder} disabled={loading || cart.items.length === 0}>
                {loading ? "Створення…" : "Підтвердити замовлення"}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
