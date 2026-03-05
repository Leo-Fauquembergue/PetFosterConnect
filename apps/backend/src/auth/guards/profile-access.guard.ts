import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";

@Injectable()
export class ProfileAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const user = request.user; // Injecté par JwtStrategy

    // 🛡️ SÉCURITÉ : Empêche le crash (Erreur 500) si le JwtAuthGuard a été oublié
    if (!user) {
      throw new ForbiddenException("Accès interdit : utilisateur non authentifié");
    }

    const requestedUserId = Number(request.params.id);

    // 🛡️ SÉCURITÉ : Stoppe net les requêtes malformées (ex: /users/abc)
    if (Number.isNaN(requestedUserId)) {
      throw new ForbiddenException("Accès interdit : format d'ID invalide");
    }

    // Admin → OK (Privilège absolu)
    if (user.role === "admin") {
      return true;
    }

    // Utilisateur lui-même → OK (Propriétaire de la ressource)
    if (user.id === requestedUserId) {
      return true;
    }

    throw new ForbiddenException(
      "Accès interdit : vous ne pouvez modifier que votre propre ressource"
    );
  }
}
