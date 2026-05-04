import { Test, TestingModule } from "@nestjs/testing";
import * as argon2 from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { RefreshTokenService } from "./refresh-token.service";

jest.mock("argon2");

describe("RefreshTokenService", () => {
  let service: RefreshTokenService;

  const mockPrisma = {
    refreshToken: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefreshTokenService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("doit créer un refresh token haché", async () => {
    (argon2.hash as jest.Mock).mockResolvedValue("hashed_token");
    await service.createRefreshToken(1, "plain_token", new Date());

    expect(argon2.hash).toHaveBeenCalledWith("plain_token");
    expect(mockPrisma.refreshToken.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 1, tokenHash: "hashed_token" }),
      })
    );
  });

  it("doit valider un token existant", async () => {
    mockPrisma.refreshToken.findMany.mockResolvedValue([
      { id: "1", tokenHash: "hash1" },
      { id: "2", tokenHash: "hash2" },
    ]);

    // Simuler que le 2ème correspond
    (argon2.verify as jest.Mock).mockImplementation((hash, _token) =>
      Promise.resolve(hash === "hash2")
    );

    const result = await service.validateRefreshToken(1, "plain");
    expect(result).toEqual({ id: "2", tokenHash: "hash2" });
  });

  it("doit renvoyer null si aucun token ne correspond", async () => {
    mockPrisma.refreshToken.findMany.mockResolvedValue([{ id: "1", tokenHash: "hash1" }]);

    (argon2.verify as jest.Mock).mockResolvedValue(false);

    const result = await service.validateRefreshToken(1, "plain");
    expect(result).toBeNull();
  });

  it("doit révoquer tous les tokens d'un utilisateur", async () => {
    await service.revokeAllUserTokens(1);
    expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
      where: { userId: 1, revokedAt: null },
      data: { revokedAt: expect.any(Date) },
    });
  });
});
