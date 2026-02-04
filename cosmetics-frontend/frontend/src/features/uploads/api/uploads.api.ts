// src/features/uploads/api/uploads.api.ts
import { api } from "@/core/api/axios";

export type UploadedFile = {
  name: string;
  size?: number;
  createdAt?: string;
  url?: string;
};

function normalizeFiles(data: any): UploadedFile[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.files)) return data.files;
  return [];
}

export const UploadsApi = {
  // ✅ список файлів (admin): бек вертає { files: [...] }
  async getFiles(): Promise<UploadedFile[]> {
    const { data } = await api.get("/api/upload", { withCredentials: true });
    return normalizeFiles(data);
  },

  // ✅ upload 1..10 фото товару (admin)
  // Swagger: POST /api/upload/products multipart/form-data images[]
  async uploadProductImages(files: File[]): Promise<{ urls: string[] }> {
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f)); // field = images

    const { data } = await api.post("/api/upload/products", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    // очікуємо { urls: [...] }
    return { urls: Array.isArray(data?.urls) ? data.urls : [] };
  },

  // ✅ delete by url (admin)
  async deleteProductImageByUrl(url: string) {
    const { data } = await api.delete("/api/upload/by-url", {
      data: { url },
      withCredentials: true,
    });
    return data;
  },
};
