import React, { useEffect, useState } from "react";
import { MetaTags } from "@/app/seo/MetaTags";
import { useNavigate } from "react-router-dom";
import Input from "@/shared/ui/Input";
import Select from "@/shared/ui/Select";
import Button from "@/shared/ui/Button";
import { AdminShell, AdminRow } from "@/admin/_ui/AdminShell";
import { adminCreateProduct, adminGetCategories, CategoryDTO } from "@/admin/api/admin.api";
import { AdminUploadsApi } from "@/admin/api/uploads.api";

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
  });

  // ✅ image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(""); // буде URL з бекенду
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    adminGetCategories().then(setCats).catch(() => setCats([]));
  }, []);

  async function onUpload() {
    if (!imageFile) return alert("Select an image first");
    setUploading(true);
    try {
      const url = await AdminUploadsApi.uploadProductImage(imageFile);
      setImageUrl(url);
      alert("Image uploaded ✅");
    } catch (e: any) {
      console.error(e);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

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

        // ✅ головне: images[]
        images: imageUrl ? [imageUrl] : [],
      });

      nav("/admin/products");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <MetaTags title="Admin — Create Product" />
      <AdminShell
        title="Create product"
        subtitle="1) Upload image → 2) Create product with images[]"
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

          {/* ✅ Upload block */}
          <AdminRow label="Product image">
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />

              <div className="flex gap-2 items-center">
                <Button variant="outline" onClick={onUpload} disabled={!imageFile || uploading}>
                  {uploading ? "Uploading..." : "Upload image"}
                </Button>

                {imageUrl && (
                  <Button
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(imageUrl)}
                  >
                    Copy URL
                  </Button>
                )}
              </div>

              {imageUrl && (
                <div className="space-y-2">
                  <div className="text-xs text-neutral-400 break-all">{imageUrl}</div>
                  <img
                    src={imageUrl}
                    alt="product"
                    className="w-40 h-40 object-cover rounded-xl border border-neutral-800"
                  />
                </div>
              )}
            </div>
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
