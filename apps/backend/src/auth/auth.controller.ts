import { Body, Controller, Get, Post, Req, Res, UseGuards, UsePipes } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { RequestWithUser } from "@projet/shared-types";
import * as sharedTypes from "@projet/shared-types";
import type { Request, Response } from "express";
import { ZodPipe } from "../common/pipes/zod.pipe";
import { COOKIE_NAME } from "../constants";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  @Get("csrf")
  @ApiOperation({ summary: "Obtenir un jeton CSRF" })
  getCsrfToken(@Req() req: Request) {
    const jwtCookie = req.cookies[COOKIE_NAME];

    if (jwtCookie) {
      try {
        const payload = this.jwtService.verify(jwtCookie, {
          secret: this.configService.get<string>("JWT_SECRET"),
        });
        return { csrfToken: payload.csrfToken };
      } catch {
        // En cas d'erreur de décodage, on retombe sur le cas anonyme
      }
    }

    // Pour les anonymes, on retourne un jeton statique.
    // Sa simple présence dans le header x-csrf-token protégera contre le CSRF
    // car un attaquant ne peut pas forcer l'ajout d'un header personnalisé
    // sans un preflight CORS réussi (qu'il n'aura pas depuis evil.com).
    return { csrfToken: "initial" };
  }

  @Post("register")
  @ApiOperation({ summary: "Inscription d'un nouvel utilisateur" })
  @UsePipes(new ZodPipe(sharedTypes.RegisterSchema))
  async register(@Body() dto: sharedTypes.RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, token, csrfToken } = await this.authService.register(dto);
    this.setCookie(res, token);
    return { user, access_token: token, csrfToken };
  }

  @Post("login")
  @ApiOperation({ summary: "Connexion de l'utilisateur" })
  @UsePipes(new ZodPipe(sharedTypes.LoginSchema))
  async login(@Body() dto: sharedTypes.LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, token, csrfToken } = await this.authService.login(dto);
    this.setCookie(res, token);
    return { user, access_token: token, csrfToken };
  }

  @Post("logout")
  @ApiOperation({ summary: "Déconnexion de l'utilisateur" })
  async logout(@Res({ passthrough: true }) res: Response) {
    const isProd = process.env.NODE_ENV === "production";
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      domain: process.env.COOKIE_DOMAIN || undefined,
    });
    return { message: "Déconnexion réussie" };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer le profil de l'utilisateur connecté" })
  async getMe(@Req() req: RequestWithUser) {
    // Permet au Front de rafraîchir son store avec la BDD fraîche
    return this.usersService.getProfile(req.user.id);
  }

  private setCookie(res: Response, token: string) {
    const isProd = process.env.NODE_ENV === "production";

    /**
     * SÉCURITÉ : Configuration des cookies
     *
     * - sameSite: "none" est requis si le Front et le Back sont sur des domaines différents (ex: Vercel et Render).
     *   ATTENTION : Cela expose l'application aux attaques CSRF si aucune autre protection n'est en place.
     *   Nous avons désormais lié le token CSRF au payload JWT.
     */
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      domain: process.env.COOKIE_DOMAIN || undefined,
      maxAge: 1000 * 60 * 60 * 24, // 24 heures
    });
  }
}
