import type { CreateSellerProductRequest } from "@market-place/shared/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSellerProduct,
  getSellerProducts,
} from "@/api/modules/sellerProducts";

export function useSellerProductsQuery() {
  return useQuery({
    queryKey: ["seller-products"],
    queryFn: getSellerProducts,
  });
}

export function useCreateSellerProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSellerProductRequest) => createSellerProduct(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["seller-products"] });
    },
  });
}
