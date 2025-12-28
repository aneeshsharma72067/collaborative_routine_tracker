"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isAxiosError } from "axios";
import * as authApi from "@/services/auth-api";
import type { User, LoginCredentials, RegisterData } from "@/types/user";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
}

type ErrorResponse = {
  message?: string | string[];
  error?: string;
};

function transformApiError(error: unknown): Error {
  if (isAxiosError(error)) {
    const fallback = "Request failed. Please try again.";
    const payload = error.response?.data as ErrorResponse | undefined;

    if (!payload) {
      return new Error(error.message || fallback);
    }

    if (Array.isArray(payload.message) && payload.message.length > 0) {
      return new Error(payload.message[0]);
    }

    if (typeof payload.message === "string" && payload.message.trim().length > 0) {
      return new Error(payload.message);
    }

    if (payload.error && payload.error.trim().length > 0) {
      return new Error(payload.error);
    }

    return new Error(fallback);
  }

  if (error instanceof Error) {
    return error;
  }

  return new Error("Unexpected error. Please try again.");
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      hasHydrated: false,

      login: async (credentials: LoginCredentials) => {
        try {
          const response = await authApi.login(credentials);

          const resolvedUser: User = {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
          };

          set({
            user: resolvedUser,
            accessToken: response.accessToken,
            isAuthenticated: true,
          });
        } catch (error) {
          throw transformApiError(error);
        }
      },

      register: async (data: RegisterData) => {
        try {
          await authApi.register(data);

          const loginResult = await authApi.login({
            email: data.email,
            password: data.password,
          });

          const resolvedUser: User = {
            id: loginResult.user.id,
            email: loginResult.user.email,
            name: loginResult.user.name ?? data.name,
          };

          set({
            user: resolvedUser,
            accessToken: loginResult.accessToken,
            isAuthenticated: true,
          });
        } catch (error) {
          throw transformApiError(error);
        }
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User | null) => {
        set({
          user,
          isAuthenticated: user !== null,
        });
      },

      setToken: (token: string | null) => {
        set({ accessToken: token });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

useAuthStore.persist.onHydrate(() => {
  useAuthStore.setState({ hasHydrated: false });
});

useAuthStore.persist.onFinishHydration(() => {
  useAuthStore.setState({ hasHydrated: true });
});

if (typeof window !== "undefined") {
  useAuthStore.persist.rehydrate();
}
