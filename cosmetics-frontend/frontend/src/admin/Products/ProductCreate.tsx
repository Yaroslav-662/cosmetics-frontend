import React, { useEffect, useRef, useState } from "react";
import { MetaTags } from "@/app/seo/MetaTags";
import { useNavigate } from "react-router-dom";
import Input from "@/shared/ui/Input";
import Select from "@/shared/ui/Select";
import Button from "@/shared/ui/Button";
import { AdminShell, AdminRow } from "@/admin/_ui/AdminShell";
import { adminCreateProduct, adminGetCategories, CategoryDTO } from "@/admin/api/admin.api";
import { UploadsApi } from "@/features/uploads/api/uploads.api";

const MAX_IMAGES = 10;

export default function ProductCreate() {
  const nav = useNavigate();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [cats, setCats] = useState<CategoryDTO[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: 0,
    stock: 0,
    category: "",
    description: "",
    images: [] as string[],
  });

  useEffect(() => {
    adminGetCategories().then(setCats).catch(() => setCats([]));
  }, []);

  const canAdd = form.images.length < MAX_IMAGES;

  const pick = () => {
    if (!canAdd) return alert(`Максимум ${MAX_IMAGES} фото`);
    fileRef.current?.click();
  };

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    e.target.value = "";
    if (!list?.length) return;

    const files = Array.from(list).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return alert("Вибери зображення (jpg/png/webp/gif).");

    const free = MAX_IMAGES - form.images.length;
    const sliced = files.slice(0, free);

    setUploading(true);
    try {
      const res = await UploadsApi.uploadProductImages(sliced);
      if (!res.urls.length) return alert("Upload не повернув urls (перевір 401/токен).");
      setForm((p) => ({ ...p, images: [...p.images, ...res.urls] }));
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || err?.message || "Upload error");
    } finally {
      setUploading(false);
    }
  };

  const removeOne = async (url: string) => {
    // optimistic
    setForm((p) => ({ ...p, images: p.images.filter((x) => x !== url) }));
    try {
      await UploadsApi.deleteProductImageByUrl(url);
    } catch {
      // не критично: файл може лишитися на сервері
    }
  };

  const onSave = async () => {
    const name = form.name.trim();
    if (!name) return alert("Name is required");
    if (!Number.isFinite(form.price) || form.price <= 0) return alert("Price must be > 0");

    setSaving(true);
    try {
      await adminCreateProduct({
        name,
        price: Number(form.price),
        stock: Number(form.stock || 0),
        category: form.category || undefined,
        description: form.description?.trim() || undefined,
        images: form.images, // ✅ головне
      });
      nav("/admin/products");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || err?.message || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <MetaTags title="Admin — Create Product" />
      <AdminShell
        title="Create product"
        subtitle="POST /api/products (name, price; optional: images[], category, description, stock)"
        right={<Button variant="outline" onClick={() => nav(-1)}>Back</Button>}
      >
        <div className="space-y-4">
          <AdminRow label="Name *">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </AdminRow>

          <AdminRow label="Price *">
            <Input type="number" value={String(form.price)} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </AdminRow>

          <AdminRow label="Stock">
            <Input type="number" value={String(form.stock)} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
          </AdminRow>

          <AdminRow label="Category">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">— none —</option>
              {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </Select>
          </AdminRow>

          <AdminRow label="Description">
            <textarea
              className="w-full rounded-lg bg-black/40 border border-neutral-800 p-3 text-sm text-white outline-none focus:border-neutral-600 min-h-[120px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </AdminRow>

          {/* ✅ PHOTOS */}
          <AdminRow label={`Photos (${form.images.length}/${MAX_IMAGES})`}>
            <div className="space-y-3">
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />

              <div className="flex gap-2 flex-wrap items-center">
                <Button variant="outline" onClick={pick} disabled={!canAdd || uploading}>
                  {uploading ? "Uploading…" : "Add photos"}
                </Button>

                {form.images.length > 0 && (
                  <Button variant="outline" onClick={() => setForm((p) => ({ ...p, images: [] }))} disabled={uploading}>
                    Clear (local)
                  </Button>
                )}
              </div>

              {form.images.length === 0 ? (
                <div className="text-sm text-neutral-500">Немає фото.</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {form.images.map((url) => (
                    <div key={url} className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">
                      <div className="aspect-square bg-black/30">
                        <img src={url} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="p-2 flex items-center justify-between gap-2">
                        <div className="text-[10px] text-neutral-500 truncate" title={url}>{url}</div>
                        <Button size="sm" variant="outline" onClick={() => removeOne(url)} disabled={uploading}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AdminRow>

          <div className="pt-2 flex gap-2">
            <Button onClick={onSave} disabled={saving || uploading}>
              {saving ? "Saving…" : "Create"}
            </Button>
            <Button variant="outline" onClick={() => nav("/admin/products")} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      </AdminShell>
    </>
  );
}


