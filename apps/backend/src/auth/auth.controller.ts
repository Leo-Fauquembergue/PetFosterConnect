import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { JwtPayload, RequestWithUser } from "@projet/shared-types";
import * as sharedTypes from "@projet/shared-types";
import type { Request, Response } from "express";
import { ZodPipe } from "../common/pipes/zod.pipe";
import { COOKIE_NAME } from "../constants";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RefreshTokenService } from "./refresh-token.service";

const REFRESH_TOKEN_COOKIE = "refresh_token";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService
  ) {}

  @Get("csrf")
  @ApiOperation({ summary: "Obtenir un jeton CSRF" })
  getCsrfToken(@Req() req: Request) {
    const accessToken = req.cookies[COOKIE_NAME];
    if (accessToken) {
      try {
        const payload = this.jwtService.verify<JwtPayload>(accessToken, {
          secret: this.configService.get<string>("JWT_SECRET"),
        });
        return { csrfToken: payload.csrfToken };
      } catch {}
    }
    return { csrfToken: "initial" };
  }

  @Post("register")
  @ApiOperation({ summary: "Inscription d'un nouvel utilisateur" })
  @UsePipes(new ZodPipe(sharedTypes.RegisterSchema))
  async register(@Body() dto: sharedTypes.RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken, csrfToken } = await this.authService.register(dto);
    this.setAuthCookies(res, accessToken, refreshToken);
    return { user, csrfToken };
  }

  @Post("login")
  @ApiOperation({ summary: "Connexion de l'utilisateur" })
  @UsePipes(new ZodPipe(sharedTypes.LoginSchema))
  async login(@Body() dto: sharedTypes.LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, accessToken, refreshToken, csrfToken } = await this.authService.login(dto);
    this.setAuthCookies(res, accessToken, refreshToken);
    return { user, csrfToken };
  }

  @Post("refresh")
  @ApiOperation({ summary: "Rafraîchir le jeton d'accès" })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) throw new UnauthorizedException("Refresh token manquant");

    const accessToken = req.cookies[COOKIE_NAME];
    const payload = this.jwtService.decode<JwtPayload>(accessToken);
    const userId = payload?.sub;
    if (!userId) throw new UnauthorizedException("Token invalide");

    const validToken = await this.refreshTokenService.validateRefreshToken(userId, refreshToken);
    if (!validToken) {
      await this.refreshTokenService.revokeAllUserTokens(userId);
      throw new UnauthorizedException("Session expirée");
    }

    await this.refreshTokenService.revokeToken(validToken.id);
    const newTokens = await this.authService.generateAuthTokens(
      userId,
      payload.email,
      payload.role
    );

    this.setAuthCookies(res, newTokens.accessToken, newTokens.refreshToken);
    return { csrfToken: newTokens.csrfToken };
  }

  @Post("logout")
  @ApiOperation({ summary: "Déconnexion de l'utilisateur" })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
    if (refreshToken) {
      const accessToken = req.cookies[COOKIE_NAME];
      const payload = this.jwtService.decode<JwtPayload>(accessToken);
      if (payload?.sub) await this.refreshTokenService.revokeAllUserTokens(payload.sub);
    }

    this.clearAuthCookies(res);
    return { message: "Déconnexion réussie" };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer le profil de l'utilisateur connecté" })
  async getMe(@Req() req: RequestWithUser) {
    return this.usersService.getProfile(req.user.id);
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? ("none" as const) : ("lax" as const),
      domain: process.env.COOKIE_DOMAIN || undefined,
    };

    res.cookie(COOKIE_NAME, accessToken, { ...cookieOptions, maxAge: 1000 * 60 * 60 });
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...cookieOptions,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
  }

  private clearAuthCookies(res: Response) {
    const isProd = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? ("none" as const) : ("lax" as const),
      domain: process.env.COOKIE_DOMAIN || undefined,
    };
    res.clearCookie(COOKIE_NAME, cookieOptions);
    res.clearCookie(REFRESH_TOKEN_COOKIE, cookieOptions);
  }
}
