import apiClient from "@/api/axios";
import { setStoredCsrfToken } from "@/api/csrf";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export type AuthResponse = ApiResponse<{
  user: User;
}>;

export type MeResponse = ApiResponse<{
  user: User;
}>;

export type CsrfResponse = ApiResponse<{
  csrfToken: string;
}>;

export async function getCsrfToken(): Promise<string> {
  const response = await apiClient.get<CsrfResponse>("/auth/csrf");

  const token = response.data.data.csrfToken;

  setStoredCsrfToken(token);

  return token;
}

export async function register(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(
    "/auth/register",
    payload,
  );

  return response.data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/login", payload);

  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await apiClient.get<MeResponse>("/users/me");

  return response.data.data.user;
}

export async function logout(): Promise<void> {
  await apiClient.post("/auth/logout");

  setStoredCsrfToken(null);
}
