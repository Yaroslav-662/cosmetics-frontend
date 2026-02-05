import { api } from "@/core/api/axios";

export type UploadListItem = {
  name: string;
  size: number;
  createdAt: string;
  url: string;
};

export const uploadsApi = {
  // ✅ бекенд віддає { files: [...] }
  async getFiles() {
    const { data } = await api.get<{ files: UploadListItem[] }>("/api/upload", {
      withCredentials: true,
    });
    return data.files;
  },

  async uploadFile(file: File) {
    const fd = new FormData();
    fd.append("file", file);

    const { data } = await api.post("/api/upload/file", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    return data;
  },

  async deleteFile(name: string) {
    const { data } = await api.delete(`/api/upload/${encodeURIComponent(name)}`, {
      withCredentials: true,
    });
    return data;
  },

  async renameFile(payload: { oldName: string; newName: string }) {
    const { data } = await api.put("/api/upload/rename", payload, {
      withCredentials: true,
    });
    return data;
  },

  async uploadProductImages(files: File[]) {
    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));

    const { data } = await api.post("/api/upload/products", fd, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    return data as { urls: string[]; files?: any[]; message?: string };
  },

  async deleteProductImageByUrl(url: string) {
    const { data } = await api.delete("/api/upload/by-url", {
      data: { url },
      withCredentials: true,
    });
    return data;
  },
};

// ✅ backward-compat для твого коду
export { uploadsApi as UploadsApi };
