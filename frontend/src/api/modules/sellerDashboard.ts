import type { SellerDashboardMetricsResponse } from "@market-place/shared/api";

import { apiClient } from "@/api/client";

export async function getSellerDashboardMetrics() {
  const response = await apiClient.get<SellerDashboardMetricsResponse>("/seller/metrics");
  return response.data;
}
