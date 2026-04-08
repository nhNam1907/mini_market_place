import type { LoginRequest, RegisterRequest } from "@market-place/shared/api";
import { useMutation } from "@tanstack/react-query";

import { getMe, login, register } from "@/api/modules/auth";
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
      setAuth({ token, user });
    },
    onError: () => {
      clearAuth();
    },
  });
}

async function getMeWithToken(token: string) {
  const previousToken = useAuthStore.getState().token;

  useAuthStore.getState().setToken(token);

  try {
    return await getMe();
  } catch (error) {
    if (previousToken) {
      useAuthStore.getState().setToken(previousToken);
    } else {
      useAuthStore.getState().clearAuth();
    }

    throw error;
  }
}
