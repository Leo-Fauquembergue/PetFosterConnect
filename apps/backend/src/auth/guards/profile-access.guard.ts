import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";

@Injectable()
export class ProfileAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const user = request.user; // injecté par JwtStrategy
    const requestedUserId = Number(request.params.id);

    // Admin → OK
    if (user.role === "admin") {
      return true;
    }

    // Utilisateur lui-même → OK
    if (user.id === requestedUserId) {
      return true;
    }
    console.log(
      `ProfileAccessGuard: accès refusé pour l'utilisateur ID ${user.id} au profil ID ${requestedUserId}`
    );
    throw new ForbiddenException("Accès interdit");
  }
}
