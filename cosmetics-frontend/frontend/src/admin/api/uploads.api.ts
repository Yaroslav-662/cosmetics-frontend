import { api } from "@/core/api/axios";

export const AdminUploadsApi = {
  async uploadProductImage(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("image", file);

    const { data } = await api.post("/api/uploads/products", fd, {
      withCredentials: true, // якщо auth cookies
      headers: { "Content-Type": "multipart/form-data" },
    });

    // бек повертає { url: "https://.../uploads/products/..." }
    return data.url as string;
  },
};
