import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "@prisma/client";
import { ROLES_KEY } from "../decorators/roles.decorators";

/**
 * Guard vérifiant si l'utilisateur connecté possède le rôle requis pour accéder à la ressource.
 * Il doit être utilisé conjointement avec JwtAuthGuard.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Récupération des rôles requis définis par le décorateur @Roles()
    // On vérifie d'abord au niveau de la méthode (handler), puis au niveau de la classe (controller)
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // S'il n'y a pas de rôles requis, la route est autorisée (ouverte à tous les connectés)
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Récupération de l'objet Request d'Express
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Si aucun utilisateur n'est attaché à la requête (non authentifié) ou s'il n'a pas de rôle
    if (!user || !user.role) {
      return false;
    }

    // Vérification finale : le rôle de l'utilisateur est-il inclus dans la liste des rôles requis ?
    return requiredRoles.includes(user.role);
  }
}
