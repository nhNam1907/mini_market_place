import type {
  AddCartItemRequest,
  AddCartItemResponse,
  CartResponse,
  CategoryListResponse,
  HealthResponse,
  PublicProductDetailResponse,
  PublicProductListParams,
  PublicProductListResponse,
  PublicShopDetailResponse,
  PublicShopProductListResponse,
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
