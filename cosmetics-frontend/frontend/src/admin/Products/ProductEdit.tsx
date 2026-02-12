// src/admin/Products/ProductEdit.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import { ProductImagesUploader } from "@/features/products/ui/ProductImagesUploader";
import { adminUploadProductImages } from "@/admin/api/upload.api";
import { api } from "@/core/api/axios";

interface Product {
  _id: string;
  name: string;
  price: number;
  description?: string;
  images: string[];
}

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Завантаження продукту
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get<Product>(`/api/products/${id}`)
      .then((res) => setProduct(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (!product) return <div className="text-white">Loading…</div>;

  // Локальні функції для роботи з картинками
  function pickFiles(file: File) {
    setProduct((p) => p ? { ...p, images: [...p.images, URL.createObjectURL(file)] } : p);
  }

  function removeImage(url: string) {
    setProduct((p) => p ? { ...p, images: p.images.filter((i) => i !== url) } : p);
  }

  function makeMain(url: string) {
    setProduct((p) => p ? { ...p, images: [url, ...p.images.filter((i) => i !== url)] } : p);
  }

  async function onSave() {
    if (!product) return;
    setSaving(true);
    try {
      await api.put(`/api/products/${product._id}`, product);
      alert("Product saved!");
      navigate("/admin/products");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error saving product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 p-4 text-white">
      <h1 className="text-2xl font-bold">Edit Product</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label>Name</label>
          <Input
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
          />

          <label>Price</label>
          <Input
            type="number"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
          />

          <label>Description</label>
          <Input
            value={product.description || ""}
            onChange={(e) => setProduct({ ...product, description: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label>Images</label>
          <ProductImagesUploader
            value={product.images}
            onChange={(imgs) => setProduct({ ...product, images: imgs })}
          />
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button variant="outline" onClick={() => navigate("/admin/products")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
