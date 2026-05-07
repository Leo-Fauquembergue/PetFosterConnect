// ⚡ Importation stricte du UserWithProfiles
import type { LoginDto, RegisterDto, UserWithProfiles } from "@projet/shared-types";
import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { authApi } from "../api/authApi";

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  logout: () => Promise<void>;
  login: (credentials: LoginDto) => Promise<{
    access_token: string;
    user: UserWithProfiles;
    csrfToken: string;
  }>;
  register: (data: RegisterDto) => Promise<{
    access_token: string;
    user: UserWithProfiles;
    csrfToken: string;
  }>;
  user: UserWithProfiles | null; // ⚡ Utilisation du type étendu
  setUser: (user: UserWithProfiles | null) => void;
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
        await authApi.getCsrfToken(); // Récupère et configure le jeton CSRF
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
    return res;
  };

  const register = async (data: RegisterDto) => {
    const res = await authApi.register(data);
    setUser(res.user);
    setIsLoggedIn(true);
    return res;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn("Échec de la déconnexion API (déjà déconnecté ?)", err);
    } finally {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, logout, login, register, user, setUser, isLoading }}
    >
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
