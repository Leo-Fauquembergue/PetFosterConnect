// ⚡ Importation stricte du UserWithProfiles
import type { LoginDto, RegisterDto, UserWithProfiles } from "@projet/shared-types";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { authApi } from "../api/authApi";

interface AuthContextType {
  isLoggedIn: boolean;
  logout: () => Promise<void>;
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  user: UserWithProfiles | null; // ⚡ Utilisation du type étendu
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserWithProfiles | null>(null); // ⚡ Typage du state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await authApi.getMe();
        setUser(data);
        setIsLoggedIn(true);
      } catch {
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (credentials: LoginDto) => {
    const res = await authApi.login(credentials);
    setUser(res.user);
    setIsLoggedIn(true);
  };

  const register = async (data: RegisterDto) => {
    const res = await authApi.register(data);
    setUser(res.user);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await authApi.logout();
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, logout, login, register, user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};
