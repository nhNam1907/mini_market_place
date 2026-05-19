import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";

export function useLogout(redirectTo = "/login") {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useCallback(() => {
    clearAuth();
    queryClient.clear();
    navigate(redirectTo, { replace: true, state: null });
  }, [clearAuth, navigate, redirectTo]);
}
