import type {
  AddCartItemRequest,
  AddCartItemResponse,
  CancelOrderResponse,
  CancelOrderItemResponse,
  CartResponse,
  CategoryListResponse,
  CheckoutResponse,
  HealthResponse,
  PublicProductDetailResponse,
  PublicProductListParams,
  PublicProductListResponse,
  PublicShopDetailResponse,
  PublicShopProductListResponse,
  RemoveCartItemResponse,
  UpdateCartItemRequest,
  UpdateCartItemResponse,
  UserOrderDetailResponse,
  UserOrderListParams,
  UserOrderListResponse,
} from "@market-place/shared/api";

import { apiClient } from "@/api/client";

export async function getHealth() {
  const response = await apiClient.get<HealthResponse>("/health");
  return response.data;
}

export async function getPublicProducts(params: PublicProductListParams = {}) {
  const response = await apiClient.get<PublicProductListResponse>("/store/products", {
    params,
  });
  return response.data;
}

export async function getPublicProductDetail(productId: string) {
  const response = await apiClient.get<PublicProductDetailResponse>(`/store/products/${productId}`);
  return response.data;
}

export async function getPublicShopDetail(shopId: string) {
  const response = await apiClient.get<PublicShopDetailResponse>(`/store/shops/${shopId}`);
  return response.data;
}

export async function getPublicShopProducts(shopId: string, params: PublicProductListParams = {}) {
  const response = await apiClient.get<PublicShopProductListResponse>(`/store/shops/${shopId}/products`, {
    params,
  });
  return response.data;
}

export async function getCategories() {
  const response = await apiClient.get<CategoryListResponse>("/categories");
  return response.data;
}

export async function getCart() {
  const response = await apiClient.get<CartResponse>("/cart");
  return response.data;
}

export async function addCartItem(payload: AddCartItemRequest) {
  const response = await apiClient.post<AddCartItemResponse>("/cart/items", payload);
  return response.data;
}

export async function updateCartItemQuantity(cartItemId: string, payload: UpdateCartItemRequest) {
  const response = await apiClient.put<UpdateCartItemResponse>(`/cart/items/${cartItemId}`, payload);
  return response.data;
}

export async function removeCartItem(cartItemId: string) {
  const response = await apiClient.delete<RemoveCartItemResponse>(`/cart/items/${cartItemId}`);
  return response.data;
}

export async function checkout() {
  const response = await apiClient.post<CheckoutResponse>("/orders/checkout");
  return response.data;
}

export async function getUserOrders(params: UserOrderListParams = {}) {
  const response = await apiClient.get<UserOrderListResponse>("/orders", {
    params,
  });
  return response.data;
}

export async function getUserOrderDetail(orderId: string) {
  const response = await apiClient.get<UserOrderDetailResponse>(`/orders/${orderId}`);
  return response.data;
}

export async function cancelOrder(orderId: string) {
  const response = await apiClient.patch<CancelOrderResponse>(`/orders/${orderId}/cancel`);
  return response.data;
}

export async function cancelOrderItem(orderId: string, orderItemId: string) {
  const response = await apiClient.patch<CancelOrderItemResponse>(
    `/orders/${orderId}/items/${orderItemId}/cancel`,
  );
  return response.data;
}
