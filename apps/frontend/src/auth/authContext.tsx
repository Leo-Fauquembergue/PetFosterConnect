import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "../api/api";

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  logout: () => Promise<void>;
  user: any | null;
  setUser: (user: any | null) => void;
  isLoading: boolean; // ✅ Ajout
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true); // ✅ true au départ

  // ✅ Vérifier l'auth au chargement
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/me", { withCredentials: true });
        setUser(response.data);
        setIsLoggedIn(true);
      } catch {
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false); // ✅ Fin du chargement
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    await api.post("/auth/logout", {}, { withCredentials: true });
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, logout, user, setUser, isLoading }}
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
