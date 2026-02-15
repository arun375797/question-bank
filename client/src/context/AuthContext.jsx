import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import api from "../api/client";

const STORAGE_KEY = "site_auth_token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  });
  const [loading, setLoading] = useState(!!token);
  const tokenRef = useRef(token);

  tokenRef.current = token;

  const setToken = useCallback((value) => {
    setTokenState(value);
    if (typeof window !== "undefined") {
      if (value) localStorage.setItem(STORAGE_KEY, value);
      else localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const login = useCallback(async (password) => {
    try {
      const res = await api.post("/auth/verify", { password });
      const data = res.data?.data ?? res.data;
      const newToken = data?.token;
      if (newToken) {
        setToken(newToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [setToken]);

  const logout = useCallback(() => setToken(null), [setToken]);

  const isUnlocked = !!token;

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    api.get("/auth/me").then(() => {
      setLoading(false);
    }).catch((err) => {
      if (err.response?.status === 401) setToken(null);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    api.setAuthCallbacks?.({
      getToken: () => tokenRef.current,
      onUnauthorized: () => setToken(null),
    });
  }, [setToken]);

  const value = { isUnlocked, loading, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
