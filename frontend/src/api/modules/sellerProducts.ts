import type {
  CreateSellerProductRequest,
  CreateSellerProductResponse,
  SellerProductListResponse,
} from "@market-place/shared/api";

import { apiClient } from "@/api/client";

export async function getSellerProducts() {
  const response = await apiClient.get<SellerProductListResponse>("/seller/products");
  return response.data;
}

export async function createSellerProduct(payload: CreateSellerProductRequest) {
  const response = await apiClient.post<CreateSellerProductResponse>("/seller/products", payload);
  return response.data;
}
