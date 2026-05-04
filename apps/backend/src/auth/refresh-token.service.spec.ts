import { Test, TestingModule } from "@nestjs/testing";
import { RefreshTokenService } from "./refresh-token.service";
import { PrismaService } from "../prisma/prisma.service";
import * as argon2 from "argon2";

jest.mock("argon2");

describe("RefreshTokenService", () => {
  let service: RefreshTokenService;
  let prisma: jest.Mocked<Partial<PrismaService>>;

  beforeEach(async () => {
    prisma = {
      refreshToken: {
        create: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        { provide: PrismaService, useValue: prisma },
      ],
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
    expect(prisma.refreshToken!.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ userId: 1, tokenHash: "hashed_token" })
    }));
  });

  it("doit valider un token existant", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.refreshToken!.findMany as jest.Mock).mockResolvedValue([
      { id: "1", tokenHash: "hash1" },
      { id: "2", tokenHash: "hash2" }
    ] as any);
    
    // Simuler que le 2ème correspond
    (argon2.verify as jest.Mock).mockImplementation((hash, _token) => Promise.resolve(hash === "hash2"));

    const result = await service.validateRefreshToken(1, "plain");
    expect(result).toEqual({ id: "2", tokenHash: "hash2" });
  });

  it("doit renvoyer null si aucun token ne correspond", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.refreshToken!.findMany as jest.Mock).mockResolvedValue([
      { id: "1", tokenHash: "hash1" }
    ] as any);
    
    (argon2.verify as jest.Mock).mockResolvedValue(false);

    const result = await service.validateRefreshToken(1, "plain");
    expect(result).toBeNull();
  });

  it("doit révoquer tous les tokens d'un utilisateur", async () => {
    await service.revokeAllUserTokens(1);
    expect(prisma.refreshToken!.updateMany).toHaveBeenCalledWith({
      where: { userId: 1, revokedAt: null },
      data: { revokedAt: expect.any(Date) }
    });
  });
});
