import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { UserRole } from "@prisma/client";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { COOKIE_NAME } from "../../constants";
import { PrismaService } from "../../prisma/prisma.service";

// ⚡ Définition stricte du payload
export interface JwtPayload {
  sub: string | number;
  email: string;
  role: UserRole;
  csrfToken: string; // 🛡️ SÉCURITÉ : Jeton lié cryptographiquement au JWT
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request) => req?.cookies?.[COOKIE_NAME],
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET") || "fallback_secret",
    });
  }

  // ⚡ On remplace `any` par l'interface `JwtPayload`
  async validate(payload: JwtPayload) {
    const id = Number(payload.sub);

    // 🛡️ SÉCURITÉ : On vérifie que l'utilisateur existe toujours et n'est pas soft-deleted
    const user = await this.prisma.pfcUser.findUnique({
      where: { id },
      select: { deletedAt: true },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException("Session invalide ou compte supprimé");
    }

    return {
      // L'astuce chirurgicale : on force la conversion du 'sub' (String ou Number) en Number
      // pour que tout le reste de l'application (Guards, Prisma) reçoive un entier valide.
      id,
      email: payload.email,
      role: payload.role,
    };
  }
}
