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
    
    // 🛡️ SÉCURITÉ : On bloque la connexion si l'utilisateur est soft-deleted
    if (!user || user.deletedAt) {
      throw new UnauthorizedException("Email ou mot de passe incorrect");
    }

    const isValid = await argon2.verify(user.password, dto.password);
    if (!isValid) throw new UnauthorizedException("Email ou mot de passe incorrect");

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const userSafe = await this.usersService.getProfile(user.id);
    return { user: userSafe, token };
  }

  async register(dto: RegisterDto) {
    // 🛡️ VÉRIFICATION : L'email est-il déjà pris par un utilisateur ACTIF ?
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

    const token = this.jwtService.sign({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const userSafe = await this.usersService.getProfile(newUser.id);
    return { user: userSafe, token };
  }
}
