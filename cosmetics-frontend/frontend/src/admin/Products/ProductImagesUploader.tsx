import React, { useMemo, useState } from "react";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import { uploadsApi } from "@/features/uploads/api/uploads.api";


type Props = {
  value: string[];               // поточні url фото (з форми товару)
  onChange: (urls: string[]) => void;
  max?: number;                  // default 10
};

export function ProductImagesUploader({ value, onChange, max = 10 }: Props) {
  const [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<File[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const previews = useMemo(() => picked.map((f) => ({ f, url: URL.createObjectURL(f) })), [picked]);

  async function upload() {
    setErr(null);
    if (picked.length === 0) return;

    if (picked.length + value.length > max) {
      setErr(`Максимум ${max} фото. Зараз: ${value.length}, вибрано: ${picked.length}`);
      return;
    }

    setBusy(true);
    try {
      const res = await uploadsApi.uploadProductImages(files);
      onChange([...value, ...res.urls]);
      setPicked([]);
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(url: string) {
    if (!confirm("Видалити фото?")) return;

    setBusy(true);
    setErr(null);
    try {
      // видаляє файл з uploads/products по URL
      await uploadsApi.deleteProductImageByUrl(url);
      onChange(value.filter((x) => x !== url));
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-800 p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="text-white font-semibold">Фото товару</div>
          <div className="text-neutral-400 text-sm">PNG/JPG/WebP, до {max} фото</div>
        </div>
        <div className="text-neutral-400 text-sm">{value.length}/{max}</div>
      </div>

      {err && <div className="mb-3 text-sm text-red-400">{err}</div>}

      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <input
          type="file"
          accept="image/*"
          multiple
          className="flex-1 text-sm text-neutral-300"
          onChange={(e) => setPicked(Array.from(e.target.files || []))}
          disabled={busy}
        />
        <Button onClick={upload} disabled={busy || picked.length === 0}>
          {busy ? "Uploading..." : `Upload (${picked.length})`}
        </Button>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {previews.map(({ f, url }) => (
            <div key={f.name} className="rounded-xl overflow-hidden border border-neutral-800">
              <img src={url} alt={f.name} className="w-full h-24 object-cover" />
              <div className="p-2 text-xs text-neutral-400 truncate">{f.name}</div>
            </div>
          ))}
        </div>
      )}

      {value.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {value.map((url) => (
            <div key={url} className="rounded-xl overflow-hidden border border-neutral-800">
              <img src={url} alt="product" className="w-full h-28 object-cover" />
              <div className="p-2 flex justify-between items-center gap-2">
                <a href={url} target="_blank" rel="noreferrer" className="text-xs text-gold-300 truncate">
                  Open
                </a>
                <Button variant="danger" onClick={() => remove(url)} disabled={busy}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-neutral-500 text-sm">Фото ще не додано.</div>
      )}
    </div>
  );
}
