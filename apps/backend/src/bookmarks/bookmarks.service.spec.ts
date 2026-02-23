import { BookMarksService } from './bookmarks.service';
import { NotFoundException } from '@nestjs/common';

describe('BookMarksService', () => {
  let service: BookMarksService;
  let mockPrisma: any;

  beforeEach(async () => {
    // 1. On crée un mock très explicite
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
    // On passe le mock directement au constructeur pour être SÛR qu'il soit utilisé
    service = new BookMarksService(mockPrisma as any);
  });

  it('devrait lever une erreur si animal inexistant', async () => {
    // On simule le retour null de Prisma
    mockPrisma.animal.findUnique.mockResolvedValue(null);

    // On teste le rejet
    await expect(service.toggle(1, 999)).rejects.toThrow(NotFoundException);
    
    // On vérifie que prisma a bien été appelé
    expect(mockPrisma.animal.findUnique).toHaveBeenCalledWith({
      where: { id: 999 },
    });
  });

  it('devrait être défini', () => {
    expect(service).toBeDefined();
  });
});