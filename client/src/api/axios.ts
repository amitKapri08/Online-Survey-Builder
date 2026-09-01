import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getStoredCsrfToken } from "./csrf";

interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<void> | null = null;

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const errorCode = error.response?.data?.code;

    if (
      error.response?.status !== 401 ||
      errorCode !== "ACCESS_TOKEN_EXPIRED" ||
      originalRequest._retry ||
      originalRequest.url === "/auth/refresh" ||
      originalRequest.url === "/auth/csrf" ||
      originalRequest.url === "/auth/login" ||
      originalRequest.url === "/auth/register" ||
      originalRequest.url === "/auth/logout"
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = apiClient
        .post("/auth/refresh")
        .then(() => {
          // New access-token cookie has been set by the backend.
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const pendingRefresh = refreshPromise;

    try {
      await pendingRefresh;

      return apiClient(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);

apiClient.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();

  const requiresCsrf =
    method === "post" ||
    method === "put" ||
    method === "patch" ||
    method === "delete";

  if (requiresCsrf) {
    const csrfToken = getStoredCsrfToken();

    if (csrfToken) {
      config.headers.set("X-CSRF-Token", csrfToken);
    }
  }

  return config;
});

export default apiClient;
