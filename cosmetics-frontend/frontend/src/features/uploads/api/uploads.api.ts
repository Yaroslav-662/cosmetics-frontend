// src/features/uploads/api/uploads.api.ts
import { api } from "@/core/api/axios";

export type UploadedFile = {
  name: string;
  size?: number;
  createdAt?: string;
  url?: string;
};

type UploadManyResponse =
  | { message?: string; urls: string[] }
  | { message?: string; files: Array<{ url: string }> };

type FilesResponse =
  | { files: UploadedFile[] }
  | UploadedFile[];

function normalizeFilesResponse(data: any): UploadedFile[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.files)) return data.files;
  return [];
}

function filenameFromUrl(url: string) {
  try {
    const u = new URL(url);
    return decodeURIComponent(u.pathname.split("/").pop() || "");
  } catch {
    return decodeURIComponent(url.split("/").pop() || "");
  }
}

export const UploadsApi = {
  // ✅ upload 1..10 product images (admin) -> returns urls[]
  async uploadProductImages(files: File[], max = 10): Promise<string[]> {
    const fd = new FormData();
    files.slice(0, max).forEach((f) => fd.append("images", f)); // field name = images

    const { data } = await api.post<UploadManyResponse>("/api/upload/products", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    // case A: { urls: [...] }
    if ((data as any)?.urls && Array.isArray((data as any).urls)) return (data as any).urls;

    // case B: { files: [{url}] }
    if ((data as any)?.files && Array.isArray((data as any).files)) {
      return (data as any).files.map((x: any) => x.url).filter(Boolean);
    }

    return [];
  },

  // ✅ list uploaded files (admin) -> returns array
  async getFiles(): Promise<UploadedFile[]> {
    const { data } = await api.get<FilesResponse>("/api/upload", { withCredentials: true });
    return normalizeFilesResponse(data);
  },

  // ✅ delete by URL (admin) -> swagger: DELETE /api/upload/by-url {url}
  async deleteProductImageByUrl(url: string) {
    const { data } = await api.delete("/api/upload/by-url", {
      data: { url },
      withCredentials: true,
    });
    return data;
  },

  // (optional) delete by filename
  async deleteFileByName(name: string) {
    const { data } = await api.delete(`/api/upload/${encodeURIComponent(name)}`, {
      withCredentials: true,
    });
    return data;
  },

  // fallback: delete from url by extracting filename
  async deleteByUrlAsName(url: string) {
    const name = filenameFromUrl(url);
    return this.deleteFileByName(name);
  },
};
