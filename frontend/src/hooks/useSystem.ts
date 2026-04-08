import type { AddCartItemRequest, PublicProductListParams } from "@market-place/shared/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addCartItem,
  getCart,
  getCategories,
  getHealth,
  getPublicProductDetail,
  getPublicProducts,
  getPublicShopDetail,
  getPublicShopProducts,
} from "@/api/modules/system";

export function useHealthQuery() {
  return useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
  });
}

export function usePublicProductsQuery(params: PublicProductListParams = {}) {
  return useQuery({
    queryKey: ["public-products", params],
    queryFn: () => getPublicProducts(params),
  });
}

export function usePublicProductDetailQuery(productId?: string) {
  return useQuery({
    queryKey: ["public-product-detail", productId],
    queryFn: () => getPublicProductDetail(productId!),
    enabled: Boolean(productId),
  });
}

export function usePublicShopDetailQuery(shopId?: string) {
  return useQuery({
    queryKey: ["public-shop-detail", shopId],
    queryFn: () => getPublicShopDetail(shopId!),
    enabled: Boolean(shopId),
  });
}

export function usePublicShopProductsQuery(shopId?: string, params: PublicProductListParams = {}) {
  return useQuery({
    queryKey: ["public-shop-products", shopId, params],
    queryFn: () => getPublicShopProducts(shopId!, params),
    enabled: Boolean(shopId),
  });
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
}

export function useCartQuery() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
  });
}

export function useAddCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddCartItemRequest) => addCartItem(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
