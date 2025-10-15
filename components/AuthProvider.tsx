"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getAuthToken, setAuthToken, logout as apiLogout } from "@/lib/api";
import { onUnauthorized } from "@/lib/http";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { show } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const existingToken = getAuthToken();
    setToken(existingToken);
    setIsLoading(false);
  }, []);

  const login = (newToken: string) => {
    setAuthToken(newToken);
    setToken(newToken);
  };

  const logout = () => {
    apiLogout();
    setToken(null);
  };

  useEffect(() => {
    // Global 401 handler
    const off = onUnauthorized(() => {
      apiLogout();
      setToken(null);
      show("Your session has expired. Please log in again.", "error");
      router.replace("/auth/login");
    });
    return off;
  }, [router, show]);

  const value = {
    isAuthenticated: !!token,
    token,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

