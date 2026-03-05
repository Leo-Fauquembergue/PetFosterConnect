import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { SheltersService } from "./shelters.service";

describe("SheltersService", () => {
  let service: SheltersService;

  const mockPrisma = {
    shelterProfile: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SheltersService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<SheltersService>(SheltersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("doit retourner la liste des refuges SANS le mot de passe utilisateur (Prévention Data Leak)", async () => {
      const fakeShelters = [
        {
          pfcUserId: 1,
          shelterName: "SPA",
          user: { id: 1, email: "spa@test.com", deletedAt: null },
        },
      ];
      mockPrisma.shelterProfile.findMany.mockResolvedValue(fakeShelters);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      // CORRECTION : Vérification formelle du non-leak
      expect((result[0] as any).user?.password).toBeUndefined();
    });
  });

  describe("findOne", () => {
    it("doit retourner un profil de refuge par ID SANS le mot de passe utilisateur (Prévention Data Leak)", async () => {
      const fakeProfile = {
        pfcUserId: 1,
        shelterName: "SPA",
        user: { id: 1, email: "spa@test.com", deletedAt: null },
      };
      mockPrisma.shelterProfile.findUnique.mockResolvedValue(fakeProfile);

      const result = await service.findOne(1);
      expect(result.shelterName).toBe("SPA");
      // CORRECTION : Vérification formelle du non-leak
      expect((result as any).user?.password).toBeUndefined();
    });

    it("doit lever une erreur si le refuge n existe pas", async () => {
      mockPrisma.shelterProfile.findUnique.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow();
    });
  });

  describe("update", () => {
    const dto = { shelterName: "SPA Modifiée" };

    it("doit modifier les informations du profil du refuge", async () => {
      mockPrisma.shelterProfile.update.mockResolvedValue({
        pfcUserId: 1,
        shelterName: "SPA Modifiée",
      });

      const result = await service.update(1, dto as any);

      expect(mockPrisma.shelterProfile.update).toHaveBeenCalledWith({
        where: { pfcUserId: 1 },
        data: dto,
      });
      expect(result.shelterName).toBe("SPA Modifiée");
    });
  });
});
