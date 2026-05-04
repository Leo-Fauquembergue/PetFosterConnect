import { randomBytes } from "node:crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { LoginDto, RegisterDto } from "@projet/shared-types";
import * as argon2 from "argon2";
import { UsersService } from "../users/users.service";
import { RefreshTokenService } from "./refresh-token.service";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService
  ) {}

  async generateAuthTokens(userId: number, email: string, role: string) {
    const csrfToken = randomBytes(32).toString("hex");
    const accessToken = this.jwtService.sign({ sub: userId, email, role, csrfToken });
    const refreshToken = randomBytes(64).toString("hex");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 jours

    await this.refreshTokenService.createRefreshToken(userId, refreshToken, expiresAt);

    return { accessToken, refreshToken, csrfToken };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || user.deletedAt) {
      throw new UnauthorizedException("Email ou mot de passe incorrect");
    }

    const isValid = await argon2.verify(user.password, dto.password);
    if (!isValid) throw new UnauthorizedException("Email ou mot de passe incorrect");

    const tokens = await this.generateAuthTokens(user.id, user.email, user.role);
    const userSafe = await this.usersService.getProfile(user.id);
    return { user: userSafe, ...tokens };
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser && !existingUser.deletedAt) {
      throw new UnauthorizedException("Cet email est déjà utilisé.");
    }

    const newUser = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      role: dto.role,
      siret: dto.siret ?? "",
      shelterName: dto.shelterName ?? "",
    });

    const tokens = await this.generateAuthTokens(newUser.id, newUser.email, newUser.role);
    const userSafe = await this.usersService.getProfile(newUser.id);
    return { user: userSafe, ...tokens };
  }
}
