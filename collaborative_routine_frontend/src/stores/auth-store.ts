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

function pickFirstMessage(source: unknown): string | null {
  if (typeof source === "string") {
    const trimmed = source.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (Array.isArray(source)) {
    for (const entry of source) {
      const resolved = pickFirstMessage(entry);
      if (resolved) {
        return resolved;
      }
    }
    return null;
  }

  if (source && typeof source === "object") {
    const record = source as Record<string, unknown>;
    const prioritizedKeys = ["message", "error", "detail", "description", "title", "errors"];

    for (const key of prioritizedKeys) {
      if (key in record) {
        const resolved = pickFirstMessage(record[key]);
        if (resolved) {
          return resolved;
        }
      }
    }

    for (const value of Object.values(record)) {
      const resolved = pickFirstMessage(value);
      if (resolved) {
        return resolved;
      }
    }
  }

  return null;
}

function transformApiError(error: unknown): Error {
  if (isAxiosError(error)) {
    const fallback = "Request failed. Please try again.";
    const payload = error.response?.data as unknown;
    const resolvedMessage = pickFirstMessage(payload);

    if (resolvedMessage) {
      return new Error(resolvedMessage);
    }

    const statusText = error.response?.statusText;
    const statusCode = error.response?.status;
    if (statusText || statusCode) {
      const readableStatus = [statusText, statusCode]
        .filter((part) => Boolean(part))
        .join(" ")
        .trim();
      if (readableStatus.length > 0) {
        return new Error(readableStatus);
      }
    }

    return new Error(error.message || fallback);
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

const persistApi = useAuthStore.persist;

if (persistApi?.onHydrate) {
  persistApi.onHydrate(() => {
    useAuthStore.setState({ hasHydrated: false });
  });
} else {
  useAuthStore.setState({ hasHydrated: true });
}

if (persistApi?.onFinishHydration) {
  persistApi.onFinishHydration(() => {
    useAuthStore.setState({ hasHydrated: true });
  });
}

if (typeof window !== "undefined") {
  persistApi?.rehydrate?.();
}
