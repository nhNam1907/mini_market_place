import type {
  SellerShopDetailResponse,
  UpdateSellerShopRequest,
  UpdateSellerShopResponse,
} from "@market-place/shared/api";

import { apiClient } from "@/api/client";

export async function getSellerShopProfile() {
  const response = await apiClient.get<SellerShopDetailResponse>("/seller/shop");
  return response.data;
}

export async function updateSellerShopProfile(payload: UpdateSellerShopRequest) {
  const response = await apiClient.patch<UpdateSellerShopResponse>("/seller/shop", payload);
  return response.data;
}
