import React, { useMemo, useState } from "react";
import Button from "@/shared/ui/Button";
import { UploadsApi } from "@/features/uploads/api/uploads.api";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
};

export default function ProductImagesUploader({ value, onChange }: Props) {
  const [picked, setPicked] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const canUpload = picked.length > 0 && picked.length <= 10 && !loading;

  const previews = useMemo(() => {
    return picked.map((f) => ({ name: f.name, url: URL.createObjectURL(f) }));
  }, [picked]);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files || []);
    setPicked(list.slice(0, 10));
  }

  async function upload() {
    if (!picked.length) return;
    setLoading(true);
    try {
      const res = await UploadsApi.uploadProductImages(picked);
      const urls = Array.isArray(res?.urls) ? res.urls : [];
      onChange([...(value || []), ...urls]);
      setPicked([]);
    } finally {
      setLoading(false);
    }
  }

  async function remove(url: string) {
    if (!confirm("Видалити фото?")) return;
    setLoading(true);
    try {
      await UploadsApi.deleteProductImageByUrl(url);
      onChange((value || []).filter((x) => x !== url));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-neutral-900/70 border border-neutral-800 p-4 rounded-xl space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={onPick}
          className="text-sm text-neutral-300"
        />
        <Button onClick={upload} disabled={!canUpload}>
          {loading ? "Uploading..." : `Upload (${picked.length}/10)`}
        </Button>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {previews.map((p) => (
            <div key={p.url} className="border border-neutral-800 rounded-lg overflow-hidden">
              <img src={p.url} className="h-24 w-full object-cover" />
              <div className="px-2 py-1 text-xs text-neutral-400 truncate">{p.name}</div>
            </div>
          ))}
        </div>
      )}

      {(value || []).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(value || []).map((url) => (
            <div key={url} className="border border-neutral-800 rounded-lg overflow-hidden">
              <img src={url} className="h-24 w-full object-cover" />
              <div className="p-2 flex justify-end">
                <Button variant="danger" onClick={() => remove(url)} disabled={loading}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(value || []).length === 0 && (
        <div className="text-sm text-neutral-400">Фото ще не додано.</div>
      )}
    </div>
  );
}
