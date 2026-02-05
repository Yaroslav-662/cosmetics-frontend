// src/features/products/ui/ProductCard.tsx

import React from "react";
import type { Product } from "../model/product.types";
import Button from "@/shared/ui/Button";
import { useCart } from "@/features/cart/model/cart.store";
import { Link } from "react-router-dom";

interface Props {
  product: Product;
}

export const ProductCard: React.FC<Props> = ({ product }) => {
  const addToCart = useCart((s) => s.add);

  const cover = product.images?.[0] || "/placeholder-product.png";

  return (
    <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 hover:border-amber-500/50 transition">
      <Link to={`/products/${product._id}`} className="block">
        <img src={cover} className="h-48 w-full object-cover rounded-lg mb-3" alt={product.name} />
        <h3 className="text-white font-semibold text-lg truncate">{product.name}</h3>
        <p className="text-neutral-400 text-sm line-clamp-2">{product.description}</p>
      </Link>

      <p className="text-amber-400 text-xl font-bold mt-2">{product.price} ₴</p>

      <Button className="w-full mt-3" onClick={() => addToCart(product)}>
        Додати в кошик
      </Button>
    </div>
  );
};


