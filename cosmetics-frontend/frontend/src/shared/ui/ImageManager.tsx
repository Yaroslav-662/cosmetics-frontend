import React, { useMemo, useRef, useState } from "react";
import Button from "@/shared/ui/Button";

type Props = {
  value: string[];
  onChange: (images: string[]) => void;

  // upload returns array of urls
  onUpload: (files: File[]) => Promise<string[]>;
  onDeleteRemote?: (url: string) => Promise<any>;

  max?: number;
};

export default function ImageManager({
  value,
  onChange,
  onUpload,
  onDeleteRemote,
  max = 10,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const images = Array.isArray(value) ? value : [];

  const [uploading, setUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string>("");

  const canAddMore = images.length < max;

  const previews = useMemo(() => images, [images]);

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;

    if (!canAddMore) return alert(`Максимум ${max} фото`);

    setUploading(true);
    try {
      const urls = await onUpload(files);
      if (!Array.isArray(urls) || urls.length === 0) {
        alert("Upload не повернув url");
        return;
      }

      const next = [...images, ...urls].slice(0, max);
      onChange(next);
    } catch (err: any) {
      alert(err?.message || "Помилка завантаження");
    } finally {
      setUploading(false);
    }
  }

  async function removeOne(url: string) {
    // 1) прибрати з state
    onChange(images.filter((x) => x !== url));

    // 2) (опційно) видалити з сервера
    if (!onDeleteRemote) return;
    setDeletingUrl(url);
    try {
      await onDeleteRemote(url);
    } catch {
      // не блокуємо UI
    } finally {
      setDeletingUrl("");
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handlePick}
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={!canAddMore || uploading}
        >
          {uploading ? "Uploading…" : "Add photos"}
        </Button>

        <div className="text-xs text-neutral-400">
          {images.length}/{max}
        </div>
      </div>

      {previews.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {previews.map((url) => (
            <div key={url} className="border border-neutral-800 rounded-xl p-2 bg-neutral-900/60">
              <div className="aspect-square overflow-hidden rounded-lg bg-black/30">
                <img
                  src={url}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.opacity = "0.3";
                  }}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeOne(url)}
                  disabled={deletingUrl === url}
                >
                  {deletingUrl === url ? "Deleting…" : "Remove"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-neutral-400">Фото ще не додані.</div>
      )}
    </div>
  );
}
