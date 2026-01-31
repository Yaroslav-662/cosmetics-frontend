// src/features/uploads/api/uploads.api.ts
import { api } from "@/core/api/axios";
import type { UploadedFile, RenamePayload } from "../model/upload.types";

export const UploadsApi = {
  // Загальне (file)
  async uploadFile(file: File): Promise<UploadedFile> {
    const form = new FormData();
    form.append("file", file);

    const { data } = await api.post("/api/upload/file", form, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    return data;
  },

  // ✅ NEW: фото товару (1..10) — повертає urls[]
  async uploadProductImages(files: File[]): Promise<string[]> {
    const form = new FormData();
    files.forEach((f) => form.append("images", f));

    const { data } = await api.post("/api/upload/products", form, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    return data?.urls || [];
  },

  // Список файлів (admin) — backend повертає масив
  async getFiles(): Promise<UploadedFile[]> {
    const { data } = await api.get("/api/upload", { withCredentials: true });
    return Array.isArray(data) ? data : (data.files || []);
  },

  async deleteFile(name: string) {
    const { data } = await api.delete(`/api/upload/${encodeURIComponent(name)}`, { withCredentials: true });
    return data;
  },

  async renameFile(payload: RenamePayload) {
    const { data } = await api.put("/api/upload/rename", payload, { withCredentials: true });
    return data;
  },

  // ✅ NEW: delete product image by url
  async deleteProductImageByUrl(url: string) {
    const filename = url.split("/").pop();
    if (!filename) return;
    const { data } = await api.delete(`/api/upload/products/${encodeURIComponent(filename)}`, { withCredentials: true });
    return data;
  },
};
