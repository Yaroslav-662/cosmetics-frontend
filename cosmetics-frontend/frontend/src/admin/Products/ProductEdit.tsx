// src/features/products/pages/EditProduct.tsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UploadsApi } from "@/features/uploads/api/uploads.api";
import { api } from "@/core/api/axios";
import Input from "@/shared/ui/Input";
import Select from "@/shared/ui/Select";
import Button from "@/shared/ui/Button";

interface Category {
  _id: string;
  name: string;
}

const MAX_IMAGES = 10;

export default function EditProduct() {
  const { id = "" } = useParams();
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: "",
    price: 0,
    stock: 0,
    category: "",
    description: "",
    images: [] as string[],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get("/api/categories"),
      api.get(`/api/products/${id}`),
    ])
      .then(([catRes, prodRes]) => {
        setCategories(catRes.data);
        const p = prodRes.data;
        setForm({
          name: p.name || "",
          price: p.price || 0,
          stock: p.stock || 0,
          category: p.category?._id || p.category || "",
          description: p.description || "",
          images: Array.isArray(p.images) ? p.images : [],
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const uploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    e.target.value = "";

    const free = MAX_IMAGES - form.images.length;
    const sliced = Array.from(files).slice(0, free);

    setUploading(true);
    try {
      const { urls } = await UploadsApi.uploadProductImages(sliced);
      setForm((p) => ({ ...p, images: [...p.images, ...urls] }));
    } catch (e) {
      console.error(e);
      alert("Помилка завантаження фото");
    } finally {
      setUploading(false);
    }
  };

  const saveProduct = async () => {
    setSaving(true);
    try {
      await api.put(`/api/products/${id}`, form);
      nav("/admin/products");
    } catch (e) {
      console.error(e);
      alert("Помилка збереження товару");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-4">Завантаження...</div>;

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h2 className="text-xl font-bold">Редагувати товар</h2>

      <Input
        placeholder="Назва"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <Input
        type="number"
        placeholder="Ціна"
        value={String(form.price)}
        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
      />

      <Input
        type="number"
        placeholder="Кількість на складі"
        value={String(form.stock)}
        onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
      />

      <Select
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      >
        <option value="">— Виберіть категорію —</option>
        {categories.map((c) => (
          <option key={c._id} value={c._id}>
            {c.name}
          </option>
        ))}
      </Select>

      <textarea
        placeholder="Опис"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full p-2 border rounded"
      />

      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={uploadFiles}
        />
        <Button onClick={pickFiles} disabled={form.images.length >= MAX_IMAGES || uploading}>
          {uploading ? "Завантаження..." : "Додати фото"}
        </Button>
        <div className="flex gap-2 mt-2 flex-wrap">
          {form.images.map((url, i) => (
            <div key={url} className="relative w-24 h-24 border rounded overflow-hidden">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(url)}
                className="absolute top-0 right-0 bg-red-500 text-white px-1 text-xs"
              >
                X
              </button>
              {i !== 0 && (
                <button
                  onClick={() => makeMain(i)}
                  className="absolute bottom-0 left-0 bg-yellow-400 text-black px-1 text-xs"
                >
                  Main
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="text-xs mt-1">{form.images.length}/{MAX_IMAGES} фото</div>
      </div>

      <div className="flex gap-2 mt-4">
        <Button onClick={saveProduct} disabled={saving || uploading}>
          {saving ? "Збереження..." : "Зберегти"}
        </Button>
        <Button variant="outline" onClick={() => nav("/admin/products")} disabled={saving}>
          Відмінити
        </Button>
      </div>
    </div>
  );
}

