import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiRegister, apiLogin, apiGetMe, apiWithdraw, getToken, clearToken } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  /* Restore session from saved JWT token on app start */
  useEffect(() => {
    const hydrate = async () => {
      if (!getToken()) { setLoading(false); return; }
      try {
        const me = await apiGetMe();
        setUser(me);
      } catch {
        clearToken();
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    const u = await apiRegister({ name, email, password });
    setUser(u);
    return u;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const u = await apiLogin({ email, password });
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const switchAccount = useCallback((type) => {
    setUser(prev => prev ? { ...prev, accountType: type } : prev);
  }, []);

  const withdraw = useCallback(async ({ amount, method, methodDetail }) => {
    const data = await apiWithdraw({ amount, method, methodDetail });
    setUser(data.user);
    return data;
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await apiGetMe();
    setUser(me);
    return me;
  }, []);

  const updateBalance = useCallback((delta) => {
    setUser(prev => {
      if (!prev) return prev;
      const key = prev.accountType === "demo" ? "demoBalance" : "realBalance";
      return { ...prev, [key]: Math.max(0, (prev[key] || 0) + delta) };
    });
  }, []);

  const deductBalance = useCallback((amount) => {
    setUser(prev => {
      if (!prev) return prev;
      const key = prev.accountType === "demo" ? "demoBalance" : "realBalance";
      if ((prev[key] || 0) < amount) return prev;
      return { ...prev, [key]: prev[key] - amount };
    });
  }, []);

  const currentBalance = user
    ? (user.accountType === "demo" ? (user.demoBalance || 0) : (user.realBalance || 0))
    : 0;

  return (
    <AuthContext.Provider value={{
      user, loading, currentBalance,
      register, login, logout,
      switchAccount, withdraw,
      updateBalance, deductBalance, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
