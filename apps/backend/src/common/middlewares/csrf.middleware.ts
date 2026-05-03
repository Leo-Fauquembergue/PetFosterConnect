import { ForbiddenException, Injectable, type NestMiddleware } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type { NextFunction, Request, Response } from "express";
import { COOKIE_NAME } from "../../constants";

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  use(req: Request, _res: Response, next: NextFunction) {
    // Méthodes HTTP qui modifient l'état (donc potentiellement vulnérables au CSRF)
    const mutatingMethods = ["POST", "PUT", "DELETE", "PATCH"];

    if (mutatingMethods.includes(req.method)) {
      const headerToken = req.headers["x-csrf-token"];
      const jwtCookie = req.cookies?.[COOKIE_NAME];
      const authHeader = req.headers["authorization"];

      /**
       * SÉCURITÉ : On autorise le bypass si un header Authorization est présent (Bearer token).
       * Les requêtes avec Bearer token ne sont pas vulnérables au CSRF car le navigateur
       * ne les envoie jamais automatiquement.
       */
      if (authHeader?.startsWith("Bearer ")) {
        return next();
      }

      /**
       * CAS 1 : Utilisateur authentifié via COOKIE
       * Le jeton CSRF doit correspondre à celui qui est scellé dans le JWT du cookie.
       */
      if (jwtCookie) {
        try {
          const payload = this.jwtService.verify(jwtCookie, {
            secret: this.configService.get<string>("JWT_SECRET"),
          });

          if (!headerToken || headerToken !== payload.csrfToken) {
            throw new ForbiddenException(
              "Jeton CSRF invalide ou corrompu. La session a peut-être expiré ou été compromise."
            );
          }
        } catch (error) {
          if (error instanceof ForbiddenException) throw error;
          throw new ForbiddenException("Session invalide. Protection CSRF activée.");
        }
      } else {
        /**
         * CAS 2 : Utilisateur non authentifié (ou premier appel)
         * On exige simplement la PRÉSENCE du header 'x-csrf-token'.
         */
        if (!headerToken) {
          throw new ForbiddenException(
            "En-tête de sécurité manquant. Les requêtes anonymes doivent inclure 'x-csrf-token'."
          );
        }
      }
    }

    next();
  }
}
