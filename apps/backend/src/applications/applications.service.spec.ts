import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailsService } from '../emails/emails.service';
import { ForbiddenException } from '@nestjs/common';

describe('ApplicationsService', () => {
  let service: ApplicationsService;

  const mockPrisma = {
    application: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    animal: {
      findUnique: jest.fn(),
    }
  };

  const mockEmailsService = {
    sendAcceptanceEmail: jest.fn(),
    sendRejectionEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailsService, useValue: mockEmailsService },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('doit créer une candidature', async () => {
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
        },
        include: { animal: true }
      });
    });
  });

  describe('updateStatus (Sécurité IDOR)', () => {
    const candidateId = 5;
    const animalId = 10;
    const statusDto = { applicationStatus: 'approved' as any };

    it('doit mettre à jour le statut si l\'utilisateur est le propriétaire de l\'animal', async () => {
      const shelterOwner = { id: 42, role: 'shelter' };
      const fakeAnimal = { id: animalId, pfcUserId: 42 };

      mockPrisma.animal.findUnique.mockResolvedValue(fakeAnimal);
      mockPrisma.application.update.mockResolvedValue({ applicationStatus: 'approved' });

      await service.updateStatus(candidateId, animalId, statusDto, shelterOwner);

      expect(mockPrisma.application.update).toHaveBeenCalled();
    });

    it('doit lever une ForbiddenException (Faille IDOR bloquée) si un refuge tente de modifier la demande d\'un autre refuge', async () => {
      const attackerShelter = { id: 999, role: 'shelter' };
      const fakeAnimal = { id: animalId, pfcUserId: 42 };

      mockPrisma.animal.findUnique.mockResolvedValue(fakeAnimal);

      await expect(
        service.updateStatus(candidateId, animalId, statusDto, attackerShelter)
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.application.update).not.toHaveBeenCalled();
    });

    it('doit mettre à jour le statut si l\'utilisateur est Admin (Privilège absolu)', async () => {
      const adminUser = { id: 99, role: 'admin' };
      const fakeAnimal = { id: animalId, pfcUserId: 42 };

      mockPrisma.animal.findUnique.mockResolvedValue(fakeAnimal);
      mockPrisma.application.update.mockResolvedValue({ applicationStatus: 'approved' });

      await service.updateStatus(candidateId, animalId, statusDto, adminUser);

      expect(mockPrisma.application.update).toHaveBeenCalled();
    });
  });

  describe('remove (Sécurité IDOR)', () => {
    it('doit lever une ForbiddenException si un utilisateur non propriétaire tente d\'archiver une demande', async () => {
      const attacker = { id: 999, role: 'shelter' };
      const fakeAnimal = { id: 10, pfcUserId: 42 }; 

      mockPrisma.animal.findUnique.mockResolvedValue(fakeAnimal);

      await expect(
        service.remove(5, 10, attacker)
      ).rejects.toThrow(ForbiddenException);
    });
  });
});