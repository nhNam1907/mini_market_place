import type {
  AddCartItemRequest,
  PublicProductListParams,
  UpdateCartItemRequest,
  UserOrderListParams,
} from "@market-place/shared/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addCartItem,
  cancelOrder,
  cancelOrderItem,
  checkout,
  getCart,
  getCategories,
  getHealth,
  getPublicProductDetail,
  getPublicProducts,
  getPublicShopDetail,
  getPublicShopProducts,
  getUserOrderDetail,
  getUserOrders,
  removeCartItem,
  updateCartItemQuantity,
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

export function useUpdateCartItemQuantityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cartItemId, payload }: { cartItemId: string; payload: UpdateCartItemRequest }) =>
      updateCartItemQuantity(cartItemId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cartItemId: string) => removeCartItem(cartItemId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useCheckoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkout,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cart"] });
      void queryClient.invalidateQueries({ queryKey: ["user-orders"] });
    },
  });
}

export function useUserOrdersQuery(params: UserOrderListParams = {}) {
  return useQuery({
    queryKey: ["user-orders", params],
    queryFn: () => getUserOrders(params),
  });
}

export function useUserOrderDetailQuery(orderId?: string) {
  return useQuery({
    queryKey: ["user-order-detail", orderId],
    queryFn: () => getUserOrderDetail(orderId!),
    enabled: Boolean(orderId),
  });
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => cancelOrder(orderId),
    onSuccess: (_, orderId) => {
      void queryClient.invalidateQueries({ queryKey: ["user-orders"] });
      void queryClient.invalidateQueries({ queryKey: ["user-order-detail", orderId] });
    },
  });
}

export function useCancelOrderItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, orderItemId }: { orderId: string; orderItemId: string }) =>
      cancelOrderItem(orderId, orderItemId),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["user-orders"] });
      void queryClient.invalidateQueries({
        queryKey: ["user-order-detail", variables.orderId],
      });
    },
  });
}
