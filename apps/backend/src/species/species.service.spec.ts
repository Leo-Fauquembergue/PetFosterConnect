import { Test, TestingModule } from '@nestjs/testing';
import { SpeciesService } from './species.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SpeciesService', () => {
  let service: SpeciesService;
  const mockPrisma = {
    species: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpeciesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SpeciesService>(SpeciesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('doit retourner la liste des espèces triées par nom', async () => {
      const mockSpecies = [
        { id: 1, name: 'Chat' },
        { id: 2, name: 'Chien' },
      ];
      
      // On simule le retour de Prisma
      mockPrisma.species.findMany.mockResolvedValue(mockSpecies);

      const result = await service.findAll();

      // Vérification de l'appel Prisma avec le bon tri
      expect(mockPrisma.species.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(mockSpecies);
    });
  });
});