import React, { useEffect, useRef, useState } from "react";
import { MetaTags } from "@/app/seo/MetaTags";
import { useNavigate, useParams } from "react-router-dom";
import Input from "@/shared/ui/Input";
import Select from "@/shared/ui/Select";
import Button from "@/shared/ui/Button";
import { AdminShell, AdminRow } from "@/admin/_ui/AdminShell";
import {
  adminGetCategories,
  adminGetProduct,
  adminUpdateProduct,
  adminUploadProductImages,
  adminDeleteProductImageByUrl,
  CategoryDTO,
} from "@/admin/api/admin.api";

const MAX_IMAGES = 10;

export default function ProductEdit() {
  const { id = "" } = useParams();
  const nav = useNavigate();

  const fileRef = useRef<HTMLInputElement | null>(null);

  const [cats, setCats] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyImages, setBusyImages] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: 0,
    stock: 0,
    category: "",
    description: "",
    images: [] as string[],
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [p, c] = await Promise.all([adminGetProduct(id), adminGetCategories()]);
        setCats(c);

        setForm({
          name: p.name || "",
          price: Number(p.price || 0),
          stock: Number(p.stock || 0),
          category: typeof p.category === "string" ? p.category : p.category?._id || "",
          description: p.description || "",
          images: Array.isArray(p.images) ? p.images : [],
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  async function onSave() {
    const name = form.name.trim();
    if (!name) return alert("Name is required");
    if (!Number.isFinite(form.price) || form.price <= 0) return alert("Price must be > 0");

    setSaving(true);
    try {
      await adminUpdateProduct(id, {
        name,
        price: Number(form.price),
        stock: Number(form.stock || 0),
        category: form.category || undefined,
        description: form.description?.trim() || undefined,
        images: form.images, // ✅ зберігаємо фото
      });
      nav("/admin/products");
    } finally {
      setSaving(false);
    }
  }

  const pickImages = () => fileRef.current?.click();

  const uploadImages = async (files: FileList | null) => {
    if (!files || !files.length) return;

    const current = form.images || [];
    const canAdd = Math.max(0, MAX_IMAGES - current.length);
    if (canAdd <= 0) return alert(`Максимум ${MAX_IMAGES} фото`);

    const selected = Array.from(files).slice(0, canAdd);

    setBusyImages(true);
    try {
      const urls = await adminUploadProductImages(selected);
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    } finally {
      setBusyImages(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const removeImage = async (url: string) => {
    const ok = confirm("Видалити це фото?");
    if (!ok) return;

    setBusyImages(true);
    try {
      // 1) прибрали зі списку
      setForm((prev) => ({ ...prev, images: prev.images.filter((x) => x !== url) }));
      // 2) видалили файл на сервері
      await adminDeleteProductImageByUrl(url).catch(() => {});
    } finally {
      setBusyImages(false);
    }
  };

  const moveImage = (idx: number, dir: -1 | 1) => {
    setForm((prev) => {
      const next = [...prev.images];
      const to = idx + dir;
      if (to < 0 || to >= next.length) return prev;
      [next[idx], next[to]] = [next[to], next[idx]];
      return { ...prev, images: next };
    });
  };

  const makeMain = (idx: number) => {
    setForm((prev) => {
      const next = [...prev.images];
      const [u] = next.splice(idx, 1);
      next.unshift(u);
      return { ...prev, images: next };
    });
  };

  return (
    <>
      <MetaTags title="Admin — Edit Product" />
      <AdminShell
        title="Edit product"
        subtitle="GET /api/products/:id + PUT /api/products/:id (includes images[])"
        right={<Button variant="outline" onClick={() => nav(-1)}>Back</Button>}
      >
        {loading ? (
          <div className="text-neutral-400">Завантаження…</div>
        ) : (
          <div className="space-y-4">
            <AdminRow label="Name *">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </AdminRow>

            <AdminRow label="Price *">
              <Input
                type="number"
                value={String(form.price)}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </AdminRow>

            <AdminRow label="Stock">
              <Input
                type="number"
                value={String(form.stock)}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              />
            </AdminRow>

            <AdminRow label="Category">
              <Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                aria-label="Category"
              >
                <option value="">— none —</option>
                {cats.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </AdminRow>

            <AdminRow label="Description">
              <textarea
                className="w-full rounded-lg bg-black/40 border border-neutral-800 p-3 text-sm text-white outline-none focus:border-neutral-600 min-h-[120px]"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </AdminRow>

            <AdminRow label={`Photos (1..${MAX_IMAGES})`}>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => uploadImages(e.target.files)}
                  />
                  <Button onClick={pickImages} disabled={busyImages || form.images.length >= MAX_IMAGES}>
                    {busyImages ? "Uploading…" : "Add photos"}
                  </Button>
                  <div className="text-xs text-neutral-400">
                    {form.images.length}/{MAX_IMAGES} (перше — головне)
                  </div>
                </div>

                {form.images.length === 0 ? (
                  <div className="text-sm text-neutral-400">Фото ще не додано.</div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {form.images.map((u, i) => (
                      <div key={u} className="border border-neutral-800 rounded-xl p-2 bg-neutral-900/60">
                        <div className="aspect-square overflow-hidden rounded-lg border border-neutral-800">
                          <img src={u} alt="" className="w-full h-full object-cover" />
                        </div>

                        <div className="mt-2 flex flex-wrap gap-1">
                          <Button size="sm" variant="outline" onClick={() => removeImage(u)} disabled={busyImages}>
                            Delete
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => moveImage(i, -1)} disabled={busyImages || i === 0}>
                            ↑
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => moveImage(i, 1)} disabled={busyImages || i === form.images.length - 1}>
                            ↓
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => makeMain(i)} disabled={busyImages || i === 0}>
                            Main
                          </Button>
                        </div>

                        {i === 0 && <div className="mt-1 text-[11px] text-gold-300">Main photo</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AdminRow>

            <div className="pt-2 flex gap-2">
              <Button onClick={onSave} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
              <Button variant="outline" onClick={() => nav("/admin/products")}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </AdminShell>
    </>
  );
}
