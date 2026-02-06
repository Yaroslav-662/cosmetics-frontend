import React, { useState } from "react";
import Button from "@/shared/ui/Button";
import { UploadsApi } from "@/features/uploads/api/uploads.api";

interface Props {
  value: string[];
  onChange: (images: string[]) => void;
}

export const ProductImagesUploader: React.FC<Props> = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false);

  async function onUpload(file: File) {
    setLoading(true);
    try {
      const res = await UploadsApi.uploadProductImage(file);
      onChange([...value, res.url]);
    } finally {
      setLoading(false);
    }
  }

  function remove(url: string) {
    onChange(value.filter((i) => i !== url));
  }

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
        }}
      />

      <div className="grid grid-cols-3 gap-3">
        {value.map((img) => (
          <div key={img} className="relative">
            <img
              src={img}
              className="h-32 w-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => remove(img)}
              className="absolute top-1 right-1 bg-black/70 text-white px-2 rounded"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {loading && <div className="text-sm text-neutral-400">Uploading…</div>}
    </div>
  );
};
