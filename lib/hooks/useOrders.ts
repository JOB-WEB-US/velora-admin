import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { Order, UpdateOrderStatusInput } from "@/types/order";

export function useGetOrders() {
  return useQuery<Order[]>({
    queryKey: ["admin", "orders"],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/orders");
      const rawData = data.data || data;

      if (Array.isArray(rawData)) {
        // Normalize financial fields from BE response
        return rawData.map((order: any) => ({
          ...order,
          totalPrice: order.totalPrice ?? order.financials?.totalPrice ?? 0,
          subtotal: order.subtotal ?? order.financials?.subtotal ?? 0,
          discount: order.discount ?? order.financials?.discount ?? 0,
          tax: order.tax ?? order.financials?.tax ?? 0,
          paymentMethod: order.paymentMethod ?? order.financials?.paymentMethod ?? "Credit Card",
        }));
      }

      return [];
    },
  });
}

export function useGetOrderById(id: string) {
  return useQuery<Order | null>({
    queryKey: ["admin", "orders", id],
    queryFn: async () => {
      const { data } = await apiClient.get("/admin/orders");
      const rawData = data.data || data;

      if (Array.isArray(rawData)) {
        const match = rawData.find((o: any) => o.id === id || o.orderNumber === id);
        if (match) {
          return {
            ...match,
            totalPrice: match.totalPrice ?? match.financials?.totalPrice ?? 0,
            subtotal: match.subtotal ?? match.financials?.subtotal ?? 0,
            discount: match.discount ?? match.financials?.discount ?? 0,
            tax: match.tax ?? match.financials?.tax ?? 0,
            paymentMethod: match.paymentMethod ?? match.financials?.paymentMethod ?? "Credit Card",
          };
        }
      }
      return null;
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateOrderStatusInput }) => {
      const { data } = await apiClient.patch(`/admin/orders/${id}/status`, payload);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", variables.id] });
    },
  });
}
