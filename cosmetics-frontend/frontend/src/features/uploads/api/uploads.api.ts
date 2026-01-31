// src/features/uploads/api/uploads.api.ts
import { api } from "@/core/api/axios";

export type UploadedFile = {
  name: string;
  size?: number;
  createdAt?: string;
  url?: string;
  path?: string;
};

type UploadOneResponse = {
  message?: string;
  url?: string;
  path?: string;
  filename?: string;
  mimetype?: string;
  size?: number;
  filePath?: string; // якщо бек колись так верне
};

type UploadManyResponse = {
  message?: string;
  urls: string[];
  files?: Array<{ url: string; path?: string; filename?: string; size?: number; mimetype?: string }>;
};

function normalizeFiles(data: any): UploadedFile[] {
  // case A: бек вернув масив напряму
  if (Array.isArray(data)) return data;

  // case B: бек вернув { files: [...] }
  if (data && Array.isArray(data.files)) return data.files;

  // case C: бек вернув { items: [...] }
  if (data && Array.isArray(data.items)) return data.items;

  return [];
}

function fileNameFromUrl(url: string) {
  try {
    const u = new URL(url);
    return decodeURIComponent(u.pathname.split("/").pop() || "");
  } catch {
    return decodeURIComponent(url.split("/").pop() || "");
  }
}

export const UploadsApi = {
  // ✅ старий endpoint: /api/upload/file (1 файл)
  async uploadFile(file: File): Promise<UploadOneResponse> {
    const form = new FormData();
    form.append("file", file);

    const { data } = await api.post<UploadOneResponse>("/api/upload/file", form, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    return data;
  },

  // ✅ NEW: /api/upload/products (кілька фото товару)
  async uploadProductImages(files: File[], max = 10): Promise<string[]> {
    const form = new FormData();
    files.slice(0, max).forEach((f) => form.append("images", f)); // важливо: "images"

    const { data } = await api.post<UploadManyResponse>("/api/upload/products", form, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    // якщо бек повернув { urls: [] }
    if (data?.urls && Array.isArray(data.urls)) return data.urls;

    // якщо бек повернув { files: [{url}] }
    if (data?.files && Array.isArray(data.files)) return data.files.map((x) => x.url);

    return [];
  },

  // ✅ список файлів (адмін): /api/upload
  async getFiles(): Promise<UploadedFile[]> {
    const { data } = await api.get("/api/upload", { withCredentials: true });
    return normalizeFiles(data);
  },

  // ✅ видалення файла (адмін): /api/upload/:name
  async deleteFileByName(name: string) {
    const { data } = await api.delete(`/api/upload/${encodeURIComponent(name)}`, {
      withCredentials: true,
    });
    return data;
  },

  // ✅ видалення зображення по URL (зручно для товарів)
  async deleteProductImageByUrl(url: string) {
    const name = fileNameFromUrl(url);
    return this.deleteFileByName(name);
  },
};
