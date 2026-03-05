import { NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BookmarksService } from "./bookmarks.service";

describe("BookmarksService", () => {
  let service: BookmarksService;

  // ⚡ Typage strict pour remplacer le "any"
  let mockPrisma: {
    animal: { findUnique: jest.Mock };
    bookmark: { findUnique: jest.Mock; create: jest.Mock; delete: jest.Mock };
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
    };

    // 2. On instancie le service normalement
    // On passe le mock typé comme as unknown as PrismaService pour satisfaire TS sans perdre l'auto-complétion
    service = new BookmarksService(mockPrisma as unknown as PrismaService);
  });

  it("devrait lever une erreur si animal inexistant", async () => {
    // On simule le retour null de Prisma
    mockPrisma.animal.findUnique.mockResolvedValue(null);

    // On teste le rejet
    await expect(service.toggle(1, 999)).rejects.toThrow(NotFoundException);

    // On vérifie que prisma a bien été appelé
    expect(mockPrisma.animal.findUnique).toHaveBeenCalledWith({
      where: { id: 999 },
    });
  });

  it("devrait être défini", () => {
    expect(service).toBeDefined();
  });
});
