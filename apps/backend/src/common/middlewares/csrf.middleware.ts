import { ForbiddenException, Injectable, type NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    // Méthodes HTTP qui modifient l'état (donc potentiellement vulnérables au CSRF)
    const mutatingMethods = ["POST", "PUT", "DELETE", "PATCH"];

    if (mutatingMethods.includes(req.method)) {
      const headerToken = req.headers["x-csrf-token"];
      const cookieToken = req.cookies["csrf-token"];

      if (!headerToken || !cookieToken || headerToken !== cookieToken) {
        throw new ForbiddenException(
          "Jeton CSRF invalide ou manquant. Requête bloquée par sécurité."
        );
      }
    }

    next();
  }
}
