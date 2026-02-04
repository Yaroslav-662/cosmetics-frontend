// src/features/uploads/api/uploads.api.ts
import { api } from "@/shared/api/api"; // твій axios instance
// Якщо нема - скажи, я дам готовий

type UploadListItem = {
  name: string;
  url: string;
  size?: number;
  createdAt?: string;
  isDir?: boolean;
};

type UploadListResponse = {
  files: UploadListItem[];
};

function safeFiles(data: any): UploadListItem[] {
  const files = data?.files;
  return Array.isArray(files) ? files : [];
}

export const UploadsApi = {
  async listAll(): Promise<UploadListResponse> {
    const { data } = await api.get("/upload");
    return { files: safeFiles(data) };
  },

  async listProductImages(): Promise<UploadListResponse> {
    const { data } = await api.get("/upload/products");
    return { files: safeFiles(data) };
  },

  async uploadProductImages(files: File[]) {
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));

    const { data } = await api.post("/upload/products", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // ✅ бек повертає urls[]
    const urls = Array.isArray(data?.urls) ? data.urls : [];
    return { urls, raw: data };
  },

  async deleteProductImageByUrl(url: string) {
    const { data } = await api.delete("/upload/by-url", { data: { url } });
    return data;
  },
};
