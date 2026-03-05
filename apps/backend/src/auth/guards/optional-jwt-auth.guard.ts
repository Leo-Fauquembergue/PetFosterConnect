// apps/backend/src/auth/optional-jwt-auth.guard.ts
import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard("jwt") {
  // On surcharge la gestion de l'erreur pour ne pas bloquer la requête
  handleRequest(_err, user, _info) {
    // Si une erreur survient ou si l'user n'est pas trouvé, on renvoie null
    // mais on ne jette pas d'exception UnauthorizedException
    return user || null;
  }
}
