import { randomBytes } from "node:crypto";
import { Body, Controller, Get, Post, Req, Res, UseGuards, UsePipes } from "@nestjs/common";
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
    private readonly usersService: UsersService
  ) {}

  @Get("csrf")
  @ApiOperation({ summary: "Obtenir un jeton CSRF" })
  getCsrfToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    let token = req.cookies["csrf-token"];

    if (!token) {
      token = randomBytes(32).toString("hex");
      const isProd = process.env.NODE_ENV === "production";

      res.cookie("csrf-token", token, {
        httpOnly: true, // Non lisible par JS
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        domain: process.env.COOKIE_DOMAIN || undefined,
        path: "/",
      });
    }

    return { csrfToken: token };
  }

  @Post("register")
  @ApiOperation({ summary: "Inscription d'un nouvel utilisateur" })
  @UsePipes(new ZodPipe(sharedTypes.RegisterSchema))
  async register(@Body() dto: sharedTypes.RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.authService.register(dto);
    this.setCookie(res, token);
    return { user, access_token: token };
  }

  @Post("login")
  @ApiOperation({ summary: "Connexion de l'utilisateur" })
  @UsePipes(new ZodPipe(sharedTypes.LoginSchema))
  async login(@Body() dto: sharedTypes.LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.authService.login(dto);
    this.setCookie(res, token);
    return { user, access_token: token };
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
     *   Nous avons désormais ajouté un mécanisme de token CSRF (endpoint /auth/csrf + CsrfMiddleware).
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
