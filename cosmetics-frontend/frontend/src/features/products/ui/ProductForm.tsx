import React from "react";
import Input from "@/shared/ui/Input";
import Button from "@/shared/ui/Button";
import { ProductImagesUploader } from "./ProductImagesUploader";
import CategorySelect from "@/features/categories/ui/CategorySelect";

export type ProductFormData = {
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryId: string;
  isActive: boolean;
};

interface Props {
  value: ProductFormData;
  onChange: (v: ProductFormData) => void;
  onSubmit: () => void;
  loading?: boolean;
}

export const ProductForm: React.FC<Props> = ({
  value,
  onChange,
  onSubmit,
  loading,
}) => {
  return (
    <div className="space-y-6">
      <Input
        label="Назва товару"
        value={value.name}
        onChange={(e) =>
          onChange({ ...value, name: e.target.value })
        }
      />

      <textarea
        className="w-full rounded-xl bg-neutral-900 p-3"
        placeholder="Опис"
        value={value.description}
        onChange={(e) =>
          onChange({ ...value, description: e.target.value })
        }
      />

      <Input
        type="number"
        label="Ціна"
        value={value.price}
        onChange={(e) =>
          onChange({ ...value, price: Number(e.target.value) })
        }
      />

      <CategorySelect
        value={value.categoryId}
        onChange={(id) =>
          onChange({ ...value, categoryId: id })
        }
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value.isActive}
          onChange={(e) =>
            onChange({ ...value, isActive: e.target.checked })
          }
        />
        Активний товар
      </label>

      <div>
        <div className="font-semibold mb-2">Фото товару</div>
        <ProductImagesUploader
          value={value.images}
          onChange={(images) =>
            onChange({ ...value, images })
          }
        />
      </div>

      <Button onClick={onSubmit} disabled={loading}>
        {loading ? "Saving…" : "Save product"}
      </Button>
    </div>
  );
};
