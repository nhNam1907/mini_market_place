import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSellerProduct,
  getSellerProduct,
  getSellerProducts,
} from "@/api/modules/sellerProducts";

export function useSellerProductsQuery() {
  return useQuery({
    queryKey: ["seller-products"],
    queryFn: getSellerProducts,
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
