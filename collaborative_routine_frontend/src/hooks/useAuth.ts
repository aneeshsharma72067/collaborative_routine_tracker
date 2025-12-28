"use client";

import { useAuthStore } from "@/stores/auth-store";
import type { LoginCredentials, RegisterData } from "@/types/user";

export function useAuth() {
  const store = useAuthStore();

  return {
    user: store.user,
    accessToken: store.accessToken,
    isAuthenticated: store.isAuthenticated,
    hasHydrated: store.hasHydrated,
    login: (credentials: LoginCredentials) => store.login(credentials),
    register: (payload: RegisterData) => store.register(payload),
    logout: store.logout,
    setUser: store.setUser,
    setToken: store.setToken,
  };
}
