import { Test, TestingModule } from "@nestjs/testing";
import { UserRole } from "@prisma/client";
import type { User } from "@projet/shared-types";
import * as argon2 from "argon2";
import { PrismaService } from "../prisma/prisma.service";
import { UsersService } from "./users.service";

jest.mock("argon2");

describe("UsersService", () => {
  let service: UsersService;

  const mockPrisma = {
    pfcUser: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("doit créer un utilisateur et NE PAS retourner le mot de passe haché", async () => {
      (argon2.hash as jest.Mock).mockResolvedValue("hashed_password");

      mockPrisma.pfcUser.create.mockResolvedValue({
        id: 1,
        email: "test@test.com",
        role: UserRole.individual,
      });

      const dto = {
        email: "test@test.com",
        password: "password123",
        role: UserRole.individual, // ⚡ Fin du 'as any'
        phoneNumber: "0600000000",
        address: "Paris",
      };

      const result = (await service.create(dto)) as Partial<User>;

      expect(argon2.hash).toHaveBeenCalledWith("password123");
      expect(mockPrisma.pfcUser.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: dto.email,
          password: "hashed_password",
        }),
        select: expect.any(Object),
      });

      expect(result.password).toBeUndefined();
      expect(result.id).toBe(1);
    });
  });

  describe("findOne", () => {
    it("doit retourner un utilisateur par ID SANS le mot de passe", async () => {
      const mockUser = { id: 1, email: "test@test.com" };
      mockPrisma.pfcUser.findUnique.mockResolvedValue(mockUser);

      const result = (await service.findOne(1)) as Partial<User>;

      expect(result).toEqual(mockUser);
      expect(result.password).toBeUndefined();
    });
  });

  describe("findAll", () => {
    it("doit retourner tous les utilisateurs SANS leurs mots de passe", async () => {
      const mockUsers = [
        { id: 1, email: "test@test.com" },
        { id: 2, email: "admin@test.com" },
      ];
      mockPrisma.pfcUser.findMany.mockResolvedValue(mockUsers);

      const result = (await service.findAll()) as Partial<User>[];

      expect(result).toHaveLength(2);
      expect(result[0].password).toBeUndefined();
    });
  });

  describe("update", () => {
    it("doit mettre à jour un utilisateur et NE PAS retourner le mot de passe", async () => {
      const mockUser = { id: 1, email: "updated@test.com" };
      mockPrisma.pfcUser.update.mockResolvedValue(mockUser);

      const result = (await service.update(1, { email: "updated@test.com" })) as Partial<User>;

      expect(mockPrisma.pfcUser.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({ email: "updated@test.com" }),
        select: expect.any(Object),
      });
      expect(result.password).toBeUndefined();
    });
  });
});
