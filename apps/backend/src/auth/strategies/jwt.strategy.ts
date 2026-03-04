import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { COOKIE_NAME } from "../../constants";
import { UserRole } from "@prisma/client";

// ⚡ Définition stricte du payload
export interface JwtPayload {
  sub: string | number;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.[COOKIE_NAME],
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "fallback_secret", // Pour sécuriser l'inférence de String côté TS
    });
  }

  // ⚡ On remplace `any` par l'interface `JwtPayload`
  async validate(payload: JwtPayload) {
    return {
      // L'astuce chirurgicale : on force la conversion du 'sub' (String ou Number) en Number 
      // pour que tout le reste de l'application (Guards, Prisma) reçoive un entier valide.
      id: Number(payload.sub),
      email: payload.email,
      role: payload.role,
    };
  }
}