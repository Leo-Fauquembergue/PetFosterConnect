import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { LoginDto, RegisterDto } from "@projet/shared-types";
import express from "express";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthService } from "./auth.service";
import { COOKIE_NAME } from "../constants";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private isProduction = process.env.NODE_ENV === "production";

  @Post("login")
  @ApiOperation({ summary: "Se connecter" })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: express.Response
  ) {
    const { user, token } = await this.authService.login(dto);

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: this.isProduction, // 🛡️ Local = false (HTTP), Render = true (HTTPS)
      sameSite: this.isProduction ? "none" : "lax", // ⚠️ 'none' obligatoire pour le cross-domain Vercel/Render
      maxAge: 1000 * 60 * 60 * 24, // 24 heures
      path: "/",
    });

    return { user, access_token: token };
  }

  @Post("logout")
  @ApiOperation({ summary: "Se déconnecter" })
  logout(@Res({ passthrough: true }) res: express.Response) {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: this.isProduction ? "none" : "lax",
      path: "/",
    });

    return { message: "Déconnexion réussie" };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer les informations de l'utilisateur connecté" })
  me(@Req() req: any) {
    return req.user;
  }

  @Post("register")
  @ApiOperation({ summary: "Créer un nouveau compte utilisateur" })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: express.Response
  ) {
    const { user, token } = await this.authService.register(dto);

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: this.isProduction, // 🛡️ Local = false (HTTP), Render = true (HTTPS)
      sameSite: this.isProduction ? "none" : "lax", // ⚠️ 'none' obligatoire pour le cross-domain Vercel/Render
      maxAge: 1000 * 60 * 60 * 24, // 24 heures
      path: "/",
    });

    return { user, access_token: token };
  }
}