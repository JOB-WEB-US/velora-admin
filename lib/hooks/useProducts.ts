import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { Product, CreateProductInput, CreateVariantInput } from "@/types/product";

export function useGetProducts() {
  return useQuery<Product[]>({
    queryKey: ["admin", "products"],
    queryFn: async () => {
      const { data } = await apiClient.get("/products");
      const rawList = data.data || data;
      return Array.isArray(rawList) ? rawList : [];
    },
  });
}

export function useGetProductById(id: string) {
  return useQuery<Product | null>({
    queryKey: ["admin", "products", id],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/products/${id}`);
        return data.data || data;
      } catch {
        const { data } = await apiClient.get("/products");
        const list = data.data || data;
        if (Array.isArray(list)) {
          const match = list.find((p: any) => p.id === id || p.slug === id);
          if (match) return match;
        }
        return null;
      }
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newProduct: CreateProductInput) => {
      const { data } = await apiClient.post("/admin/products", newProduct);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateProductInput> }) => {
      const res = await apiClient.patch(`/admin/products/${id}`, data);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products", variables.id] });
    },
  });
}

export function useAddVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variantData: CreateVariantInput) => {
      const res = await apiClient.post(`/admin/products/${variantData.productId}/variants`, variantData);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products", variables.productId] });
    },
  });
}

export function useUpdateVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ variantId, productId, data }: { variantId: string; productId: string; data: Partial<CreateVariantInput> }) => {
      const res = await apiClient.patch(`/admin/products/variants/${variantId}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.refetchQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useDeleteVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ variantId, productId }: { variantId: string; productId: string }) => {
      const res = await apiClient.delete(`/admin/products/variants/${variantId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.refetchQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.delete(`/admin/products/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}
