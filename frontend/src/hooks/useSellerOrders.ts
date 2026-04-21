import type {
  SellerOrderItemStatus,
  SellerOrderListParams,
  UpdateSellerOrderItemStatusRequest,
} from "@market-place/shared/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getSellerOrderDetail,
  getSellerOrderItems,
  updateSellerOrderItemStatus,
} from "@/api/modules/sellerOrders";

export function useSellerOrderItemsQuery(params: SellerOrderListParams = {}) {
  return useQuery({
    queryKey: ["seller-order-items", params],
    queryFn: () => getSellerOrderItems(params),
  });
}

export function useSellerOrderDetailQuery(orderId?: string) {
  return useQuery({
    queryKey: ["seller-order-detail", orderId],
    queryFn: () => getSellerOrderDetail(orderId as string),
    enabled: Boolean(orderId),
  });
}

export function useUpdateSellerOrderItemStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orderItemId,
      status,
    }: {
      orderItemId: string;
      status: SellerOrderItemStatus;
    }) =>
      updateSellerOrderItemStatus(orderItemId, {
        status,
      } satisfies UpdateSellerOrderItemStatusRequest),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["seller-order-items"] });
      void queryClient.invalidateQueries({ queryKey: ["seller-order-detail"] });
    },
  });
}
