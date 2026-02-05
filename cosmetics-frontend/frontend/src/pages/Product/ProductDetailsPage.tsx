import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Product } from "@/features/products/model/product.types";
import { ProductGallery } from "@/features/products/ui/ProductGallery";
import Button from "@/shared/ui/Button";
import { useCart } from "@/features/cart/model/cart.store";
import axios from "axios";
import { API_URL } from "@/core/config/env";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const addToCart = useCart((s) => s.add);

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const { data } = await axios.get<Product>(`${API_URL}/api/products/${id}`);
        setProduct(data);
      } catch (e: any) {
        setErr(e?.response?.data?.message || "Не вдалося завантажити товар");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="text-neutral-400">Завантаження…</div>;
  if (err) return <div className="text-red-400">{err}</div>;
  if (!product) return <div className="text-neutral-400">Товар не знайдено.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ProductGallery images={product.images || []} />

      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
        <h1 className="text-white text-2xl font-bold">{product.name}</h1>
        <div className="text-amber-400 text-2xl font-extrabold mt-2">{product.price} ₴</div>

        <div className="text-neutral-300 mt-4 whitespace-pre-line">{product.description}</div>

        <div className="text-neutral-400 text-sm mt-4">В наявності: {product.stock}</div>

        <Button className="w-full mt-6" onClick={() => addToCart(product)}>
          Додати в кошик
        </Button>
      </div>
    </div>
  );
}
