import type { LoginRequest, RegisterRequest } from "@market-place/shared/api";
import { useMutation } from "@tanstack/react-query";

import { getMe, login, register } from "@/api/modules/auth";
import { queryClient } from "@/lib/queryClient";
import { useAuthStore } from "@/store/authStore";

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (payload: RegisterRequest) => register(payload),
  });
}

export function useLoginMutation() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const loginResponse = await login(payload);
      const token = loginResponse.data.token;

      const meResponse = await getMeWithToken(token);

      return {
        message: loginResponse.message,
        token,
        user: meResponse.data,
      };
    },
    onSuccess: ({ token, user }) => {
      queryClient.clear();
      setAuth({ token, user });
    },
    onError: () => {
      queryClient.clear();
      clearAuth();
    },
  });
}

async function getMeWithToken(token: string) {
  return getMe(token);
}
