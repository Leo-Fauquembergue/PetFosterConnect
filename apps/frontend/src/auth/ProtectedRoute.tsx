import type { UserRole } from "@projet/shared-types";
import type { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Loader from "../components/ui/Loader";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: ReactNode; // Autorise l'imbrication de composants
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  // Vérification stricte avec l'Enum plutôt que des magic strings
  if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/interdit" replace />;
  }

  // S'il encapsule un composant, on le retourne, sinon on rend les sous-routes (Outlet)
  return children ? children : <Outlet />;
}
