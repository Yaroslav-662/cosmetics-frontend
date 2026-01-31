import React, { useMemo, useRef, useState } from "react";
import Button from "@/shared/ui/Button";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  onUpload: (files: File[]) => Promise<string[]>;
  onDeleteRemote?: (url: string) => Promise<void>; // якщо хочеш видаляти файл з сервера
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
  const [busy, setBusy] = useState(false);

  const canAdd = value.length < max;

  const urls = useMemo(() => value || [], [value]);

  const pick = () => inputRef.current?.click();

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const list = Array.from(files);
    const allowed = list.slice(0, Math.max(0, max - urls.length));

    setBusy(true);
    try {
      const uploaded = await onUpload(allowed);
      onChange([...urls, ...uploaded]);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const removeOne = async (url: string) => {
    const ok = confirm("Видалити це фото?");
    if (!ok) return;

    setBusy(true);
    try {
      // прибираємо зі списку товару
      onChange(urls.filter((u) => u !== url));

      // опціонально: видаляємо файл з сервера
      if (onDeleteRemote) await onDeleteRemote(url);
    } finally {
      setBusy(false);
    }
  };

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...urls];
    const to = idx + dir;
    if (to < 0 || to >= next.length) return;
    [next[idx], next[to]] = [next[to], next[idx]];
    onChange(next);
  };

  const makeMain = (idx: number) => {
    const next = [...urls];
    const [u] = next.splice(idx, 1);
    next.unshift(u);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button onClick={pick} disabled={busy || !canAdd}>
          {busy ? "Uploading…" : "Add photos"}
        </Button>
        <div className="text-xs text-neutral-400">
          {urls.length}/{max} (перше — головне)
        </div>
      </div>

      {urls.length === 0 ? (
        <div className="text-sm text-neutral-400">Фото ще не додано.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {urls.map((u, i) => (
            <div key={u} className="border border-neutral-800 rounded-xl p-2 bg-neutral-900/60">
              <div className="aspect-square overflow-hidden rounded-lg border border-neutral-800">
                <img src={u} alt="" className="w-full h-full object-cover" />
              </div>

              <div className="mt-2 flex flex-wrap gap-1">
                <Button size="sm" variant="outline" onClick={() => removeOne(u)} disabled={busy}>
                  Delete
                </Button>
                <Button size="sm" variant="outline" onClick={() => move(i, -1)} disabled={busy || i === 0}>
                  ↑
                </Button>
                <Button size="sm" variant="outline" onClick={() => move(i, 1)} disabled={busy || i === urls.length - 1}>
                  ↓
                </Button>
                <Button size="sm" variant="outline" onClick={() => makeMain(i)} disabled={busy || i === 0}>
                  Main
                </Button>
              </div>

              {i === 0 && (
                <div className="mt-1 text-[11px] text-gold-300">Main photo</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
