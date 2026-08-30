import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export interface ProductTypeAttr {
  id: string;
  name: string;
  slug: string;
  baseCost?: number;
  isActive?: boolean;
}

export interface ColorAttr {
  id: string;
  name: string;
  hexCode: string;
  isActive?: boolean;
}

export interface SizeAttr {
  id: string;
  name: string;
  sortOrder: number;
  isActive?: boolean;
}

export interface AttributesData {
  types: ProductTypeAttr[];
  colors: ColorAttr[];
  sizes: SizeAttr[];
}

export function useGetAttributes() {
  return useQuery<AttributesData>({
    queryKey: ["admin", "attributes"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/admin/attributes");
        return (
          data.data || {
            types: [],
            colors: [],
            sizes: [],
          }
        );
      } catch {
        return {
          types: [
            { id: "1", name: "T-Shirt", slug: "t-shirt", baseCost: 8.5 },
            { id: "2", name: "Hoodie", slug: "hoodie", baseCost: 18.0 },
            { id: "3", name: "Sweatshirt", slug: "sweatshirt", baseCost: 15.0 },
            { id: "4", name: "Tank Top", slug: "tank-top", baseCost: 7.5 },
            { id: "5", name: "Long Sleeve", slug: "long-sleeve", baseCost: 10.5 },
          ],
          colors: [
            { id: "1", name: "Black", hexCode: "#000000" },
            { id: "2", name: "White", hexCode: "#FFFFFF" },
            { id: "3", name: "Navy", hexCode: "#1E293B" },
            { id: "4", name: "Heather Gray", hexCode: "#94A3B8" },
            { id: "5", name: "Red", hexCode: "#EF4444" },
            { id: "6", name: "Royal Blue", hexCode: "#2563EB" },
          ],
          sizes: [
            { id: "1", name: "S", sortOrder: 1 },
            { id: "2", name: "M", sortOrder: 2 },
            { id: "3", name: "L", sortOrder: 3 },
            { id: "4", name: "XL", sortOrder: 4 },
            { id: "5", name: "2XL", sortOrder: 5 },
            { id: "6", name: "3XL", sortOrder: 6 },
          ],
        };
      }
    },
  });
}

export function useCreateProductType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (typeData: { name: string; slug: string; baseCost?: number }) => {
      const { data } = await apiClient.post("/admin/attributes/types", typeData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
    },
  });
}

export function useCreateColor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (colorData: { name: string; hexCode: string }) => {
      const { data } = await apiClient.post("/admin/attributes/colors", colorData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
    },
  });
}

export function useCreateSize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sizeData: { name: string; sortOrder?: number }) => {
      const { data } = await apiClient.post("/admin/attributes/sizes", sizeData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
    },
  });
}

export function useUpdateProductType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ProductTypeAttr> }) => {
      const res = await apiClient.patch(`/admin/attributes/types/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
    },
  });
}

export function useDeleteProductType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/admin/attributes/types/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
    },
  });
}

export function useUpdateColor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ColorAttr> }) => {
      const res = await apiClient.patch(`/admin/attributes/colors/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
    },
  });
}

export function useDeleteColor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/admin/attributes/colors/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
    },
  });
}

export function useUpdateSize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<SizeAttr> }) => {
      const res = await apiClient.patch(`/admin/attributes/sizes/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
    },
  });
}

export function useDeleteSize() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/admin/attributes/sizes/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "attributes"] });
    },
  });
}
