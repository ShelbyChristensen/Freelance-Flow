import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return setBooting(false);
    api.get("/auth/me")
      .then(res => setUser(res.data.user))
      .catch(() => localStorage.removeItem("access_token"))
      .finally(() => setBooting(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("access_token", data.access_token);
    setUser(data.user);
  };

  const register = async (email, password) => {
    const { data } = await api.post("/auth/register", { email, password });
    localStorage.setItem("access_token", data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, booting, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
