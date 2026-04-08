import type { AuthUser } from "@market-place/shared/api";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  setAuth: (payload: { user: AuthUser; token: string }) => void;
  setToken: (token: string) => void;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: ({ user, token }) => set({ user, token }),
      setToken: (token) => set((state) => ({ ...state, token })),
      setUser: (user) => set((state) => ({ ...state, user })),
      clearAuth: () => set({ user: null, token: null }),
    }),
    {
      name: "market-place-auth",
    },
  ),
);
