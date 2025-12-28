import { apiClient, type ApiResponse } from "@/lib/api-client";
import type {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  RegisterResponse,
} from "@/types/user";

export async function login(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    credentials,
  );
  return data.data;
}

export async function register(
  payload: RegisterData,
): Promise<RegisterResponse> {
  const { data } = await apiClient.post<ApiResponse<RegisterResponse>>(
    "/auth/register",
    payload,
  );
  return data.data;
}
