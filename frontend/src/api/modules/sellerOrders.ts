import type {
  SellerOrderDetailResponse,
  SellerOrderItemListResponse,
  SellerOrderListParams,
  UpdateSellerOrderItemStatusRequest,
  UpdateSellerOrderItemStatusResponse,
} from "@market-place/shared/api";

import { apiClient } from "@/api/client";

export async function getSellerOrderItems(params: SellerOrderListParams = {}) {
  const response = await apiClient.get<SellerOrderItemListResponse>("/seller/orders/items", {
    params,
  });
  return response.data;
}

export async function getSellerOrderDetail(orderId: string) {
  const response = await apiClient.get<SellerOrderDetailResponse>(`/seller/orders/${orderId}`);
  return response.data;
}

export async function updateSellerOrderItemStatus(
  orderItemId: string,
  payload: UpdateSellerOrderItemStatusRequest,
) {
  const response = await apiClient.put<UpdateSellerOrderItemStatusResponse>(
    `/seller/orders/items/${orderItemId}/status`,
    payload,
  );
  return response.data;
}
