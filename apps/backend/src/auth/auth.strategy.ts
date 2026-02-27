import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { COOKIE_NAME } from "../constants";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.[COOKIE_NAME],
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return {
      // L'astuce chirurgicale : on force la conversion du 'sub' (String) en Number 
      // pour que tout le reste de l'application (Guards, Prisma) reçoive un entier valide.
      id: Number(payload.sub),
      email: payload.email,
      role: payload.role,
    };
  }
}