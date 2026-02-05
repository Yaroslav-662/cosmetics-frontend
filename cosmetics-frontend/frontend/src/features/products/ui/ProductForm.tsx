import React, { useMemo, useState } from "react";
import Button from "@/shared/ui/Button";
import type { CreateProductDto, Product } from "../model/product.types";
import { adminDeleteProductByUrl, adminUploadProductImages } from "@/admin/api/upload.api";

interface Props {
  initial?: Product;
  onSubmit: (dto: CreateProductDto) => void;
}

export const ProductForm: React.FC<Props> = ({ initial, onSubmit }) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState((initial?.category as any) ?? "");
  const [stock, setStock] = useState(initial?.stock ?? 0);

  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [picked, setPicked] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const previews = useMemo(() => picked.map((f) => ({ f, url: URL.createObjectURL(f) })), [picked]);

  async function uploadPicked() {
    setErr(null);
    if (picked.length === 0) return;
    if (images.length + picked.length > 10) {
      setErr(`Максимум 10 фото. Зараз ${images.length}, вибрано ${picked.length}`);
      return;
    }

    setBusy(true);
    try {
      const res = await adminUploadProductImages(picked);
      setImages((p) => [...p, ...res.urls]);
      setPicked([]);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeImage(url: string) {
    if (!confirm("Видалити фото?")) return;

    setBusy(true);
    setErr(null);
    try {
      await adminDeleteProductByUrl(url);
      setImages((p) => p.filter((x) => x !== url));
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    onSubmit({
      name,
      price,
      description,
      category: String(category),
      stock,
      images,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-neutral-900/70 border border-neutral-800 p-6 rounded-xl">
      {err && <div className="text-sm text-red-400">{err}</div>}

      <div>
        <label className="text-neutral-300 text-sm">Назва</label>
        <input
          className="w-full bg-neutral-950 p-2 rounded border border-neutral-800 text-white"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-neutral-300 text-sm">Ціна</label>
        <input
          type="number"
          className="w-full bg-neutral-950 p-2 rounded border border-neutral-800 text-white"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          required
        />
      </div>

      <div>
        <label className="text-neutral-300 text-sm">Опис</label>
        <textarea
          className="w-full bg-neutral-950 p-2 rounded border border-neutral-800 text-white"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-neutral-300 text-sm">Категорія</label>
        <input
          className="w-full bg-neutral-950 p-2 rounded border border-neutral-800 text-white"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="text-neutral-300 text-sm">Наявність</label>
        <input
          type="number"
          className="w-full bg-neutral-950 p-2 rounded border border-neutral-800 text-white"
          value={stock}
          onChange={(e) => setStock(Number(e.target.value))}
          required
        />
      </div>

      {/* ✅ Images uploader */}
      <div className="rounded-xl border border-neutral-800 p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-white font-semibold">Фото товару</div>
            <div className="text-neutral-400 text-sm">До 10 фото</div>
          </div>
          <div className="text-neutral-400 text-sm">{images.length}/10</div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="file"
            accept="image/*"
            multiple
            className="flex-1 text-sm text-neutral-300"
            onChange={(e) => setPicked(Array.from(e.target.files || []))}
            disabled={busy}
          />
          <Button type="button" onClick={uploadPicked} disabled={busy || picked.length === 0}>
            {busy ? "Uploading..." : `Upload (${picked.length})`}
          </Button>
        </div>

        {previews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            {previews.map(({ f, url }) => (
              <div key={f.name} className="rounded-xl overflow-hidden border border-neutral-800">
                <img src={url} alt={f.name} className="w-full h-24 object-cover" />
                <div className="p-2 text-xs text-neutral-400 truncate">{f.name}</div>
              </div>
            ))}
          </div>
        )}

        {images.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
            {images.map((url) => (
              <div key={url} className="rounded-xl overflow-hidden border border-neutral-800">
                <img src={url} alt="product" className="w-full h-28 object-cover" />
                <div className="p-2 flex justify-between items-center gap-2">
                  <a href={url} target="_blank" rel="noreferrer" className="text-xs text-amber-300 truncate">
                    Open
                  </a>
                  <Button type="button" variant="danger" onClick={() => removeImage(url)} disabled={busy}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-neutral-500 text-sm mt-3">Фото ще не додано.</div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={busy}>
        Зберегти
      </Button>
    </form>
  );
};
