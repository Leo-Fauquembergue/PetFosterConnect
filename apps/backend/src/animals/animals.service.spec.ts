import { NotFoundException } from "@nestjs/common";
import type { CreateAnimalDto, UpdateAnimalDto } from "@projet/shared-types";
import { PrismaService } from "../prisma/prisma.service";
import { AnimalsService } from "./animals.service";

describe("AnimalsService", () => {
  let service: AnimalsService;

  const mockPrisma = {
    animal: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    application: {
      updateMany: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrisma)),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    service = new AnimalsService(mockPrisma as unknown as PrismaService);
  });

  describe("findOne", () => {
    it("devrait retourner un animal spécifique avec son statut de favori", async () => {
      const fakeAnimal = {
        id: 1,
        name: "Rex",
        bookmarks: [],
        species: { name: "Chien" },
        shelter: { shelterProfile: { name: "SPA" } },
      };

      mockPrisma.animal.findUnique.mockResolvedValue(fakeAnimal);

      const result = await service.findOne(1);

      expect(result.name).toBe("Rex");
      expect(result.isBookmarked).toBe(false);
    });

    it("devrait lancer une erreur 404 si l animal n existe pas", async () => {
      mockPrisma.animal.findUnique.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe("create", () => {
    it("devrait créer un animal et formater correctement les relations Prisma", async () => {
      const dto = {
        name: "Pongo",
        speciesId: 10,
        weight: 12.5,
      } as CreateAnimalDto;
      const userId = 5;

      mockPrisma.animal.create.mockResolvedValue({ id: 100, ...dto });

      const result = await service.create(dto, userId);

      expect(mockPrisma.animal.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: "Pongo",
          shelter: { connect: { id: userId } },
          species: { connect: { id: 10 } },
        }),
      });

      expect(result.id).toBe(100);
    });
  });

  describe("findAllByShelter", () => {
    it("devrait filtrer les animaux par l ID du refuge", async () => {
      const shelterId = 1;
      const fakeList = [
        { id: 1, name: "Rex" },
        { id: 2, name: "Max" },
      ];

      mockPrisma.animal.findMany.mockResolvedValue(fakeList);

      const result = await service.findAllByShelter(shelterId);

      expect(mockPrisma.animal.findMany).toHaveBeenCalledWith({
        where: { pfcUserId: shelterId, deletedAt: null },
        include: { species: true },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe("update", () => {
    const dto = { name: "Rex Junior" } as UpdateAnimalDto;

    it("devrait modifier les données de l animal", async () => {
      const animal = { id: 1, pfcUserId: 5, name: "Rex" };

      mockPrisma.animal.findUnique.mockResolvedValue(animal);
      mockPrisma.animal.update.mockResolvedValue({ ...animal, name: "Rex Junior" });

      const result = await service.update(1, dto);

      expect(mockPrisma.animal.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({ name: "Rex Junior" }),
      });
      expect(result.name).toBe("Rex Junior");
    });

    it("devrait lever une NotFoundException si l'animal n'existe pas (Update)", async () => {
      mockPrisma.animal.findUnique.mockResolvedValue(null);
      await expect(service.update(99, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it('devrait faire un "soft delete" si l\'animal est disponible', async () => {
      const animal = { id: 1, pfcUserId: 5, animalStatus: "available" };

      mockPrisma.animal.findUnique.mockResolvedValue(animal);
      mockPrisma.animal.update.mockResolvedValue({ ...animal, deletedAt: new Date() });

      await service.remove(1);

      expect(mockPrisma.animal.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it("devrait lever une BadRequestException si l'animal est déjà adopté ou en famille d'accueil", async () => {
      const animal = { id: 1, pfcUserId: 5, animalStatus: "adopted" };

      mockPrisma.animal.findUnique.mockResolvedValue(animal);

      await expect(service.remove(1)).rejects.toThrow(
        "Impossible de supprimer un animal déjà adopté ou en famille d'accueil afin de conserver l'historique."
      );
      expect(mockPrisma.animal.update).not.toHaveBeenCalled();
    });

    it("devrait lever une NotFoundException si l'animal n'existe pas (Remove)", async () => {
      mockPrisma.animal.findUnique.mockResolvedValue(null);
      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
    });
  });
});
