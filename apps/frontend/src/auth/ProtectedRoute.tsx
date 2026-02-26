import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export default function ProtectedRoute({
  children,
  roles,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth(); // ✅ Ajout de isLoading
  const location = useLocation();

  // ⚡ ne pas rediriger si on est sur la page de login ou inscription
  const publicPaths = ["/connexion", "/inscription"];
  if (publicPaths.includes(location.pathname)) {
    return <>{children}</>;
  }

  // ✅ Pendant le chargement, afficher un loader
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Vérification de l'authentification...</div>
      </div>
    );
  }

  // ✅ Après le chargement, vérifier l'utilisateur
  if (!user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  // ✅ Vérifier les rôles
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/non-autorise" replace />;
  }

  return <>{children}</>;
}
