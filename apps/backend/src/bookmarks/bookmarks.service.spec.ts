import { NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BookmarksService } from "./bookmarks.service";

describe("BookmarksService", () => {
  let service: BookmarksService;

  // ⚡ Typage strict pour remplacer le "any"
  let mockPrisma: {
    animal: { findUnique: jest.Mock };
    bookmark: { findUnique: jest.Mock; create: jest.Mock; delete: jest.Mock };
    $queryRaw: jest.Mock;
  };

  beforeEach(async () => {
    // 1. On crée un mock très explicite et typé
    mockPrisma = {
      animal: {
        findUnique: jest.fn(),
      },
      bookmark: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      $queryRaw: jest.fn(),
    };

    // 2. On instancie le service normalement
    service = new BookmarksService(mockPrisma as unknown as PrismaService);
  });

  it("devrait lever une erreur si animal inexistant", async () => {
    // On simule le retour null de Prisma
    mockPrisma.animal.findUnique.mockResolvedValue(null);

    // On teste le rejet
    await expect(service.toggle(1, 999)).rejects.toThrow(NotFoundException);

    // On vérifie que prisma a bien été appelé avec le select optimisé
    expect(mockPrisma.animal.findUnique).toHaveBeenCalledWith({
      where: { id: 999 },
      select: { id: true, deletedAt: true },
    });
  });

  it("devrait appeler $queryRaw pour le toggle si l'animal existe", async () => {
    // On simule l'existence de l'animal
    mockPrisma.animal.findUnique.mockResolvedValue({ id: 1, deletedAt: null });
    // On simule le retour du toggle (ajouté)
    mockPrisma.$queryRaw.mockResolvedValue([{ bookmarked: true }]);

    const result = await service.toggle(1, 1);

    expect(result).toEqual({
      bookmarked: true,
      message: "Ajouté aux favoris",
    });
    expect(mockPrisma.$queryRaw).toHaveBeenCalled();
  });
});
