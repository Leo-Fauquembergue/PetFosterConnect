import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { SpeciesService } from "./species.service";

describe("SpeciesService", () => {
  let service: SpeciesService;
  const mockPrisma = {
    species: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpeciesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<SpeciesService>(SpeciesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findAll", () => {
    it("doit retourner la liste des espèces triées par nom", async () => {
      const mockSpecies = [
        { id: 1, name: "Chat" },
        { id: 2, name: "Chien" },
      ];

      // On simule le retour de Prisma
      mockPrisma.species.findMany.mockResolvedValue(mockSpecies);

      const result = await service.findAll();

      // Vérification de l'appel Prisma avec le bon tri
      expect(mockPrisma.species.findMany).toHaveBeenCalledWith({
        orderBy: { name: "asc" },
      });
      expect(result).toEqual(mockSpecies);
    });
  });

  describe("create", () => {
    it("doit créer une nouvelle espèce", async () => {
      const newSpecies = { id: 3, name: "Oiseau" };
      mockPrisma.species.create.mockResolvedValue(newSpecies);

      const result = await service.create({ name: "Oiseau" });

      expect(mockPrisma.species.create).toHaveBeenCalledWith({
        data: { name: "Oiseau" },
      });
      expect(result).toEqual(newSpecies);
    });
  });

  describe("update", () => {
    it("doit mettre à jour une espèce", async () => {
      const updatedSpecies = { id: 1, name: "Félin" };
      mockPrisma.species.update.mockResolvedValue(updatedSpecies);

      const result = await service.update(1, { name: "Félin" });

      expect(mockPrisma.species.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: "Félin" },
      });
      expect(result).toEqual(updatedSpecies);
    });
  });

  describe("remove", () => {
    it("doit supprimer une espèce", async () => {
      const deletedSpecies = { id: 1, name: "Chat" };
      mockPrisma.species.delete.mockResolvedValue(deletedSpecies);

      const result = await service.remove(1);

      expect(mockPrisma.species.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(deletedSpecies);
    });
  });
});
