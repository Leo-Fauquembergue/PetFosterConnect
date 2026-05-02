import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { COOKIE_NAME } from "../../constants";

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
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.[COOKIE_NAME],
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET") || "fallback_secret",
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
