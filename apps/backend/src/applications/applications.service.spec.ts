import { Test, TestingModule } from "@nestjs/testing";
import type { CreateApplicationDto, UpdateApplicationStatusDto } from "@projet/shared-types";
import { EmailsService } from "../emails/emails.service";
import { PrismaService } from "../prisma/prisma.service";
import { ApplicationsService } from "./applications.service";

describe("ApplicationsService", () => {
  let service: ApplicationsService;

  const mockPrisma = {
    application: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
    },
    animal: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
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

  describe("create", () => {
    it("doit créer une candidature", async () => {
      const dto = {
        animalId: 10,
        message: "Je veux adopter",
        applicationType: "adoption",
      } as CreateApplicationDto;

      const userId = 5;

      mockPrisma.animal.findUnique.mockResolvedValue({
        id: 10,
        deletedAt: null,
        animalStatus: "available",
      });

      mockPrisma.application.create.mockResolvedValue({
        pfcUserId: userId,
        animalId: 10,
        applicationStatus: "pending",
      });

      await service.create(userId, dto);

      expect(mockPrisma.application.create).toHaveBeenCalledWith({
        data: {
          pfcUserId: userId,
          animalId: dto.animalId,
          message: dto.message,
          applicationType: dto.applicationType,
        },
        include: { animal: true },
      });
    });
  });

  describe("updateStatus", () => {
    const candidateId = 5;
    const animalId = 10;
    const statusDto = { applicationStatus: "approved" } as UpdateApplicationStatusDto;

    it("doit mettre à jour le statut d'une candidature", async () => {
      const fakeAnimal = { id: animalId, pfcUserId: 42 };

      mockPrisma.animal.findUnique.mockResolvedValue(fakeAnimal);
      mockPrisma.application.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.application.findUnique.mockResolvedValue({ applicationStatus: "approved" });

      await service.updateStatus(candidateId, animalId, statusDto);

      expect(mockPrisma.application.updateMany).toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("doit archiver une demande", async () => {
      const fakeAnimal = { id: 10, pfcUserId: 42 };
      mockPrisma.animal.findUnique.mockResolvedValue(fakeAnimal);
      mockPrisma.application.updateMany.mockResolvedValue({ count: 1 });

      await service.remove(5, 10);

      expect(mockPrisma.application.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            pfcUserId: 5,
            animalId: 10,
            deletedAt: null,
          },
        })
      );
    });
  });
});
