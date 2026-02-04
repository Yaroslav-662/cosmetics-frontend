import React, { useEffect, useState } from "react";
import { MetaTags } from "@/app/seo/MetaTags";
import { useNavigate } from "react-router-dom";
import Input from "@/shared/ui/Input";
import Select from "@/shared/ui/Select";
import Button from "@/shared/ui/Button";
import { AdminShell, AdminRow } from "@/admin/_ui/AdminShell";
import { adminCreateProduct, adminGetCategories, CategoryDTO } from "@/admin/api/admin.api";
import ImageManager from "@/shared/ui/ImageManager";
import { UploadsApi } from "@/features/uploads/api/uploads.api";

const MAX_IMAGES = 10;

export default function ProductCreate() {
  const nav = useNavigate();
  const [cats, setCats] = useState<CategoryDTO[]>([]);
  const [saving, setSaving] = useState(false);

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

  async function onSave() {
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
        images: form.images,
      });
      nav("/admin/products");
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || err?.message || "Create failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <MetaTags title="Admin — Create Product" />
      <AdminShell
        title="Create product"
        subtitle="1) Upload photos → 2) Create product with images[]"
        right={<Button variant="outline" onClick={() => nav(-1)}>Back</Button>}
      >
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
                <option key={c._id} value={c._id}>{c.name}</option>
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

          <AdminRow label={`Photos (${form.images.length}/${MAX_IMAGES})`}>
            <ImageManager
              value={form.images}
              onChange={(images) => setForm({ ...form, images })}
              onUpload={(files) => UploadsApi.uploadProductImages(files, MAX_IMAGES)}
              onDeleteRemote={(url) => UploadsApi.deleteProductImageByUrl(url)}
              max={MAX_IMAGES}
            />
          </AdminRow>

          <div className="pt-2 flex gap-2">
            <Button onClick={onSave} disabled={saving}>
              {saving ? "Saving…" : "Create"}
            </Button>
            <Button variant="outline" onClick={() => nav("/admin/products")}>
              Cancel
            </Button>
          </div>
        </div>
      </AdminShell>
    </>
  );
}
