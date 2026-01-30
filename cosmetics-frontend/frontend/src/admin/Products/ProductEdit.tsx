import React, { useEffect, useState } from "react";
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
  CategoryDTO,
} from "@/admin/api/admin.api";

export default function ProductEdit() {
  const { id = "" } = useParams();
  const nav = useNavigate();

  const [cats, setCats] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: 0,
    stock: 0,
    category: "",
    description: "",
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
      } as any);
      nav("/admin/products");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <MetaTags title="Admin — Edit Product" />
      <AdminShell
        title="Edit product"
        subtitle="GET /api/products/:id + PUT /api/products/:id"
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
