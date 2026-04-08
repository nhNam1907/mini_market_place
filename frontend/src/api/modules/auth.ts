import type {
  LoginRequest,
  LoginSuccessResponse,
  MeSuccessResponse,
  RegisterRequest,
  RegisterSuccessResponse,
} from "@market-place/shared/api";

import { apiClient } from "@/api/client";

export async function register(payload: RegisterRequest) {
  const response = await apiClient.post<RegisterSuccessResponse>("/auth/register", payload);
  return response.data;
}

export async function login(payload: LoginRequest) {
  const response = await apiClient.post<LoginSuccessResponse>("/auth/login", payload);
  return response.data;
}

export async function getMe() {
  const response = await apiClient.get<MeSuccessResponse>("/auth/me");
  return response.data;
}
