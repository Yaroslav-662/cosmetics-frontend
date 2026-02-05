import React, { useEffect, useMemo, useState } from "react";
import { MetaTags } from "@/app/seo/MetaTags";
import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import { AdminShell } from "@/admin/_ui/AdminShell";
import { adminDeleteFile, adminRenameFile, adminUploadFile } from "@/admin/api/admin.api";
import { UploadsApi } from "@/features/uploads/api/uploads.api";

type UploadItem = {
  name: string;
  url: string;
  size?: number;
  createdAt?: string;
  isDir?: boolean;
};

type Tab = "products" | "all";

export default function FilesManager() {
  const [tab, setTab] = useState<Tab>("products");

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [renames, setRenames] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res =
        tab === "products"
          ? await UploadsApi.listProductImages()
          : await UploadsApi.listAll();

      // ✅ res.files завжди масив (UploadsApi робить safe parsing)
      setItems(res.files);
    } catch (e) {
      console.error(e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const list = Array.isArray(items) ? items : [];
    if (!query) return list;
    return list.filter((x) => (x?.name || "").toLowerCase().includes(query));
  }, [items, q]);

  async function onUpload() {
    if (!file) return alert("Select file first");
    await adminUploadFile(file);
    setFile(null);
    await load();
  }

  async function onRename(oldName: string) {
    const newName = (renames[oldName] || "").trim();
    if (!newName) return alert("Enter newName");
    await adminRenameFile(oldName, newName);
    setRenames((p) => {
      const copy = { ...p };
      delete copy[oldName];
      return copy;
    });
    await load();
  }

  async function onDelete(name: string) {
    if (!confirm("Видалити файл?")) return;
    await adminDeleteFile(name);
    await load();
  }

  return (
    <>
      <MetaTags title="Admin — Files" />
      <AdminShell
        title="Files"
        subtitle={
          tab === "products"
            ? "Product images: GET /api/upload/products (admin)"
            : "Uploads: GET /api/upload (admin), POST /api/upload/file, PUT /api/upload/rename, DELETE /api/upload/:name"
        }
        right={
          <div className="flex gap-2">
            <Button
              variant={tab === "products" ? "primary" : "outline"}
              onClick={() => setTab("products")}
            >
              Product images
            </Button>
            <Button
              variant={tab === "all" ? "primary" : "outline"}
              onClick={() => setTab("all")}
            >
              All uploads
            </Button>
            <Button variant="outline" onClick={load}>
              Refresh
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Search file…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          {/* Upload залишаємо тільки для tab=all, бо /api/upload/file */}
          <div className="flex gap-2">
            <input
              type="file"
              className="flex-1 text-sm text-neutral-300"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={tab !== "all"}
              title={tab !== "all" ? "Upload доступний у вкладці All uploads" : ""}
            />
            <Button onClick={onUpload} disabled={!file || tab !== "all"}>
              Upload
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-neutral-400">Завантаження…</div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-neutral-400">
                <tr className="border-b border-neutral-800">
                  <th className="text-left py-3">Name</th>
                  <th className="text-left py-3">Preview</th>
                  <th className="text-left py-3">Info</th>
                  <th className="text-left py-3">Rename</th>
                  <th className="text-right py-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((it) => (
                  <tr key={it.url || it.name} className="border-b border-neutral-900">
                    <td className="py-3 text-white font-medium">{it.name}</td>

                    <td className="py-3">
                      {it.url ? (
                        <a
                          href={it.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gold-300 hover:text-gold-200"
                        >
                          Open
                        </a>
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}
                    </td>

                    <td className="py-3 text-xs text-neutral-400">
                      {typeof it.size === "number" ? `size: ${it.size}` : ""}
                      {it.createdAt ? ` · ${new Date(it.createdAt).toLocaleString()}` : ""}
                    </td>

                    <td className="py-3">
                      {tab === "all" ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="new name"
                            value={renames[it.name] || ""}
                            onChange={(e) =>
                              setRenames((p) => ({ ...p, [it.name]: e.target.value }))
                            }
                          />
                          <Button variant="outline" onClick={() => onRename(it.name)}>
                            Rename
                          </Button>
                        </div>
                      ) : (
                        <span className="text-neutral-500 text-xs">—</span>
                      )}
                    </td>

                    <td className="py-3">
                      <div className="flex justify-end">
                        {tab === "all" ? (
                          <Button variant="danger" onClick={() => onDelete(it.name)}>
                            Delete
                          </Button>
                        ) : (
                          <Button
                            variant="danger"
                            onClick={() => UploadsApi.deleteProductImageByUrl(it.url).then(load)}
                            disabled={!it.url}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-neutral-400">
                      Немає файлів.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </AdminShell>
    </>
  );
}


