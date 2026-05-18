import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSellerProduct,
  deleteSellerProduct,
  getSellerProduct,
  getSellerProducts,
  replaceSellerProductImages,
  restoreSellerProduct,
  updateSellerProduct,
} from "@/api/modules/sellerProducts";
import type { SellerProductStatus, UpdateSellerProductRequest } from "@market-place/shared/api";

export function useSellerProductsQuery(status?: SellerProductStatus) {
  return useQuery({
    queryKey: ["seller-products", status],
    queryFn: () => getSellerProducts({ status }),
  });
}

export function useSellerProductQuery(productId?: string) {
  return useQuery({
    enabled: Boolean(productId),
    queryKey: ["seller-product", productId],
    queryFn: () => getSellerProduct(productId as string),
  });
}

export function useCreateSellerProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FormData) => createSellerProduct(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
  });
}

export function useUpdateSellerProductMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSellerProductRequest) => updateSellerProduct(productId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      void queryClient.invalidateQueries({ queryKey: ["seller-product", productId] });
    },
  });
}

export function useReplaceSellerProductImagesMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FormData) => replaceSellerProductImages(productId, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      void queryClient.invalidateQueries({ queryKey: ["seller-product", productId] });
    },
  });
}

export function useDeleteSellerProductMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteSellerProduct(productId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      void queryClient.removeQueries({ queryKey: ["seller-product", productId] });
    },
  });
}

export function useRestoreSellerProductMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => restoreSellerProduct(productId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["seller-products"] });
      void queryClient.invalidateQueries({ queryKey: ["seller-product", productId] });
    },
  });
}
