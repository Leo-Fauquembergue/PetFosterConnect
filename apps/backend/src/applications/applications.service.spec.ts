import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  const mockPrisma = {
    application: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  it('create : doit créer une candidature avec le statut PENDING par défaut', async () => {
    const dto = { animalId: 10, message: 'Je veux adopter', applicationType: 'adoption' as any };
    const userId = 5;

    mockPrisma.application.create.mockResolvedValue({
      pfcUserId: userId,
      animalId: 10,
      applicationStatus: 'pending',
    });

    await service.create(userId, dto);

    expect(mockPrisma.application.create).toHaveBeenCalledWith({
      data: {
        pfcUserId: userId,
        animalId: dto.animalId,
        message: dto.message,
        applicationType: dto.applicationType,
        applicationStatus: 'pending', // Vérification critique
      },
    });
  });

  it('updateStatus : doit mettre à jour le statut', async () => {
    const candidateId = 5;
    const animalId = 10;
    const statusDto = { applicationStatus: 'approved' as any };

    mockPrisma.application.update.mockResolvedValue({ status: 'approved' });

    await service.updateStatus(candidateId, animalId, statusDto);

    expect(mockPrisma.application.update).toHaveBeenCalledWith(expect.objectContaining({
      where: {
        pfcUserId_animalId: { pfcUserId: candidateId, animalId },
      },
      data: { applicationStatus: 'approved' },
    }));
  });
});