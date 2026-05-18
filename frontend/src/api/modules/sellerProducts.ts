import type {
  CreateSellerProductResponse,
  DeleteSellerProductResponse,
  ReplaceSellerProductImagesResponse,
  RestoreSellerProductResponse,
  SellerProductDetailResponse,
  SellerProductListResponse,
  SellerProductListParams,
  UpdateSellerProductRequest,
  UpdateSellerProductResponse,
} from "@market-place/shared/api";

import { apiClient } from "@/api/client";

export async function getSellerProducts(params?: SellerProductListParams) {
  const response = await apiClient.get<SellerProductListResponse>("/seller/products", { params });
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

export async function updateSellerProduct(productId: string, payload: UpdateSellerProductRequest) {
  const response = await apiClient.patch<UpdateSellerProductResponse>(`/seller/products/${productId}`, payload);
  return response.data;
}

export async function replaceSellerProductImages(productId: string, payload: FormData) {
  const response = await apiClient.put<ReplaceSellerProductImagesResponse>(
    `/seller/products/${productId}/images`,
    payload,
  );
  return response.data;
}

export async function deleteSellerProduct(productId: string) {
  const response = await apiClient.delete<DeleteSellerProductResponse>(`/seller/products/${productId}`);
  return response.data;
}

export async function restoreSellerProduct(productId: string) {
  const response = await apiClient.patch<RestoreSellerProductResponse>(`/seller/products/${productId}/restore`);
  return response.data;
}
