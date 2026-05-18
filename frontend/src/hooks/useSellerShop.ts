import type { UpdateSellerShopRequest } from "@market-place/shared/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSellerShopProfile, updateSellerShopProfile } from "@/api/modules/sellerShop";

export function useSellerShopProfileQuery() {
  return useQuery({
    queryKey: ["seller-shop"],
    queryFn: getSellerShopProfile,
  });
}

export function useUpdateSellerShopProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateSellerShopRequest) => updateSellerShopProfile(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["seller-shop"] });
    },
  });
}
