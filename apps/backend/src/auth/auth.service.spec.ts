import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { UserRole } from "@prisma/client";
import type { UserWithProfiles } from "@projet/shared-types";
import * as argon2 from "argon2";
import { UsersService } from "../users/users.service";
import { AuthService } from "./auth.service";
import { RefreshTokenService } from "./refresh-token.service";

jest.mock("argon2");

describe("AuthService", () => {
  let service: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;
  let refreshTokenService: jest.Mocked<Partial<RefreshTokenService>>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      getProfile: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<Partial<UsersService>>;
    jwtService = {
      sign: jest.fn().mockReturnValue("jwt_token"),
    } as unknown as jest.Mocked<Partial<JwtService>>;
    refreshTokenService = {
      createRefreshToken: jest.fn(),
    } as unknown as jest.Mocked<Partial<RefreshTokenService>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: RefreshTokenService, useValue: refreshTokenService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("doit lever une UnauthorizedException si l'utilisateur n'existe pas", async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      await expect(service.login({ email: "test@test.com", password: "123" })).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("doit lever une UnauthorizedException si le mot de passe est incorrect", async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue({
        id: 1,
        email: "test@test.com",
        password: "hashed",
        role: "individual",
      });
      (argon2.verify as jest.Mock).mockResolvedValue(false);
      await expect(service.login({ email: "test@test.com", password: "wrong" })).rejects.toThrow(
        UnauthorizedException
      );
    });

    it("doit retourner les tokens et l'utilisateur si succès", async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue({
        id: 1,
        email: "test@test.com",
        password: "hashed",
        role: "individual",
      });
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      (usersService.getProfile as jest.Mock).mockResolvedValue({
        id: 1,
        email: "test@test.com",
      } as UserWithProfiles);

      const result = await service.login({ email: "test@test.com", password: "123" });

      expect(result.accessToken).toBe("jwt_token");
      expect(result.refreshToken).toBeDefined();
      expect(result.user?.email).toBe("test@test.com");
      expect(refreshTokenService.createRefreshToken).toHaveBeenCalled();
    });
  });

  describe("register", () => {
    it("doit lever une UnauthorizedException si l'email est déjà pris", async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue({ id: 1, deletedAt: null });
      await expect(
        service.register({ email: "test@test.com", password: "123", role: UserRole.individual })
      ).rejects.toThrow(UnauthorizedException);
    });

    it("doit créer l'utilisateur et générer les tokens", async () => {
      (usersService.findByEmail as jest.Mock).mockResolvedValue(null);
      (usersService.create as jest.Mock).mockResolvedValue({
        id: 1,
        email: "new@test.com",
        role: UserRole.individual,
      });
      (usersService.getProfile as jest.Mock).mockResolvedValue({
        id: 1,
        email: "new@test.com",
      } as UserWithProfiles);

      const result = await service.register({
        email: "new@test.com",
        password: "123",
        role: UserRole.individual,
      });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: "new@test.com" })
      );
      expect(result.accessToken).toBe("jwt_token");
      expect(result.user?.email).toBe("new@test.com");
    });
  });
});
