import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem("auth-storage");
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: { accessToken?: string } };
        const token = parsed.state?.accessToken;
        
        if (token) {
          config.headers = config.headers ?? {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // ignore storage parsing errors and continue without auth header
    }
  }

  return config;
});

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
