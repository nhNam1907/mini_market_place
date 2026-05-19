import { useQuery } from "@tanstack/react-query";

import { getSellerDashboardMetrics } from "@/api/modules/sellerDashboard";

export function useSellerDashboardMetricsQuery() {
  return useQuery({
    queryKey: ["seller-dashboard-metrics"],
    queryFn: getSellerDashboardMetrics,
  });
}
