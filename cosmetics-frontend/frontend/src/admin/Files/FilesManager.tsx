import React, { useEffect, useMemo, useState } from "react";
import { MetaTags } from "@/app/seo/MetaTags";
import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import { AdminShell } from "@/admin/_ui/AdminShell";
import { adminDeleteFile, adminGetFiles, adminRenameFile, adminUploadFile } from "@/admin/api/admin.api";
import { API_URL } from "@/core/config/env";

export default function FilesManager() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [renames, setRenames] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await adminGetFiles();
      setItems(res);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((x) => x.toLowerCase().includes(query));
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

  function fileUrl(name: string) {
    // якщо бекенд віддає статично /uploads/<name> — підженемо, якщо інакше
    return `${API_URL}/uploads/${encodeURIComponent(name)}`;
  }

  return (
    <>
      <MetaTags title="Admin — Files" />
      <AdminShell
        title="Files"
        subtitle="Uploads: GET /api/upload (admin), POST /api/upload/file, PUT /api/upload/rename, DELETE /api/upload/:name"
        right={<Button variant="outline" onClick={load}>Refresh</Button>}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="md:col-span-2">
            <Input placeholder="Search file…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <input
              type="file"
              className="flex-1 text-sm text-neutral-300"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Button onClick={onUpload} disabled={!file}>
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
                  <th className="text-left py-3">File</th>
                  <th className="text-left py-3">Preview</th>
                  <th className="text-left py-3">Rename</th>
                  <th className="text-right py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((name) => (
                  <tr key={name} className="border-b border-neutral-900">
                    <td className="py-3 text-white font-medium">{name}</td>
                    <td className="py-3">
                      <a
                        href={fileUrl(name)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gold-300 hover:text-gold-200"
                      >
                        Open
                      </a>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="new name"
                          value={renames[name] || ""}
                          onChange={(e) => setRenames((p) => ({ ...p, [name]: e.target.value }))}
                        />
                        <Button variant="outline" onClick={() => onRename(name)}>
                          Rename
                        </Button>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex justify-end">
                        <Button variant="danger" onClick={() => onDelete(name)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-neutral-400">
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