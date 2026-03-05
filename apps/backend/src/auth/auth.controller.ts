import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import type { LoginDto, RegisterDto, RequestWithUser } from "@projet/shared-types";
import type { Response } from "express";
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

  @Post("register")
  @ApiOperation({ summary: "Inscription d'un nouvel utilisateur" })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.authService.register(dto);
    this.setCookie(res, token);
    return { user, access_token: token };
  }

  @Post("login")
  @ApiOperation({ summary: "Connexion de l'utilisateur" })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, token } = await this.authService.login(dto);
    this.setCookie(res, token);
    return { user, access_token: token };
  }

  @Post("logout")
  @ApiOperation({ summary: "Déconnexion de l'utilisateur" })
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return { message: "Déconnexion réussie" };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer le profil de l'utilisateur connecté" })
  async getMe(@Req() req: RequestWithUser) {
    // Permet au Front de rafraîchir son store avec la BDD fraîche
    return this.usersService.findOne(req.user.id);
  }

  private setCookie(res: Response, token: string) {
    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 24, // 24 heures
    });
  }
}
