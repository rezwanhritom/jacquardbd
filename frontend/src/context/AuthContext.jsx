import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe, login as loginApi, register as registerApi, logout as logoutApi } from "../services/auth.service";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const { success, user: me } = await getMe();
    setUser(success ? me : null);
  }, []);

  useEffect(() => {
    getMe()
      .then(({ success, user: me }) => {
        setUser(success ? me : null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (email, password) => {
      const result = await loginApi({ email, password });
      if (result.success) {
        setUser(result.user);
      }
      return result;
    },
    []
  );

  const register = useCallback(async (name, email, password) => {
    const result = await registerApi({ name, email, password });
    // Backend does not set cookie on register; user must log in
    return result;
  }, []);

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
    return { success: true };
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
