import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { LoginDto, RegisterDto } from "@projet/shared-types";
import * as argon2 from "argon2";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException("Email ou mot de passe incorrect");

    const isValid = await argon2.verify(user.password, dto.password);
    if (!isValid) throw new UnauthorizedException("Email ou mot de passe incorrect");

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // findByEmail() retourne le user complet (avec password) → on l'exclut manuellement
    const { password, ...userSafe } = user;
    return { user: userSafe, token };
  }

  async register(dto: RegisterDto) {
    // create() utilise safeUserSelect côté UsersService :
    // le password n'est JAMAIS inclus dans le retour → pas besoin de le destructurer
    const userSafe = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      role: dto.role,
      siret: dto.siret ?? "",
      shelterName: dto.shelterName ?? "",
    });

    const token = this.jwtService.sign({
      sub: userSafe.id,
      email: userSafe.email,
      role: userSafe.role,
    });

    return { user: userSafe, token };
  }
}
