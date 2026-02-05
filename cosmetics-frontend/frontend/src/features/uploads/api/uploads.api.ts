import { api } from "@/shared/api/api";

export type UploadListItem = {
  name: string;
  size: number;
  createdAt: string;
  url: string;
};

export const uploadsApi = {
  // ===== Admin files =====
  async getFiles() {
    const { data } = await api.get<{ files: UploadListItem[] }>("/api/upload");
    return data;
  },

  async uploadFile(file: File) {
    const form = new FormData();
    form.append("file", file);

    const { data } = await api.post("/api/upload/file", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async deleteFile(name: string) {
    const { data } = await api.delete(`/api/upload/${encodeURIComponent(name)}`);
    return data;
  },

  async renameFile(oldName: string, newName: string) {
    const { data } = await api.put("/api/upload/rename", { oldName, newName });
    return data;
  },

  // ===== Product images =====
  async uploadProductImages(files: File[]) {
    const form = new FormData();
    files.forEach((f) => form.append("images", f));

    const { data } = await api.post<{ message: string; urls: string[] }>(
      "/api/upload/products",
      form,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  async deleteProductImageByUrl(url: string) {
    const { data } = await api.delete("/api/upload/by-url", { data: { url } });
    return data;
  },

  // (якщо треба — можна додати окремий список тільки product images)
  async listProductImages() {
    // якщо у бекенді нема цього маршруту — не використовуй
    const { data } = await api.get<{ files: UploadListItem[] }>("/api/upload/products");
    return data;
  },
};
