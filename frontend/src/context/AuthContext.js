import React, { createContext, useContext, useEffect, useState } from "react";
import UsersDataService from "../services/users";
import { AUTH_STORAGE_KEY, readStoredAuth } from "../auth-storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth);

  useEffect(() => {
    if (auth) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [auth]);

  const login = async (email, password) => {
    const { data } = await UsersDataService.login({ email, password });
    setAuth({ token: data.token, user: data.user });
  };

  const register = async (name, email, password) => {
    const { data } = await UsersDataService.register({ name, email, password });
    setAuth({ token: data.token, user: data.user });
  };

  const logout = () => setAuth(null);

  return (
    <AuthContext.Provider
      value={{
        user: auth?.user || null,
        token: auth?.token || null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
