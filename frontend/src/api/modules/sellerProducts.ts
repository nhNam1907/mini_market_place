import type {
  CreateSellerProductResponse,
  SellerProductDetailResponse,
  SellerProductListResponse,
} from "@market-place/shared/api";

import { apiClient } from "@/api/client";

export async function getSellerProducts() {
  const response = await apiClient.get<SellerProductListResponse>("/seller/products");
  return response.data;
}

export async function getSellerProduct(productId: string) {
  const response = await apiClient.get<SellerProductDetailResponse>(`/seller/products/${productId}`);
  return response.data;
}

export async function createSellerProduct(payload: FormData) {
  const response = await apiClient.post<CreateSellerProductResponse>("/seller/products", payload);
  return response.data;
}
