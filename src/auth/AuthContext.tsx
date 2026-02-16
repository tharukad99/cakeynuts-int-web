import React, { createContext, useContext, useMemo, useState } from "react";
import * as authApi from "../api/auth";

type AuthState = {
  isAuthed: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState<boolean>(() => !!localStorage.getItem("accessToken"));

  const login = async (email: string, password: string) => {
    const { accessToken } = await authApi.login(email, password);
    localStorage.setItem("accessToken", accessToken);
    setIsAuthed(true);
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setIsAuthed(false);
  };

  const value = useMemo(() => ({ isAuthed, login, logout }), [isAuthed]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
