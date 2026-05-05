import { Test, TestingModule } from "@nestjs/testing";
import type { CreateApplicationDto, UpdateApplicationStatusDto } from "@projet/shared-types";
import { EmailsService } from "../emails/emails.service";
import { PrismaService } from "../prisma/prisma.service";
import { ApplicationsService } from "./applications.service";

describe("ApplicationsService", () => {
  let service: ApplicationsService;

  const mockPrisma = {
    $transaction: jest.fn().mockImplementation((callback) => callback(mockPrisma)),
    application: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(), // ⚡ AJOUT : Mock de upsert
      findUniqueOrThrow: jest.fn(),
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
    it("doit créer ou mettre à jour une candidature (upsert)", async () => {
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

      mockPrisma.application.upsert.mockResolvedValue({
        pfcUserId: userId,
        animalId: 10,
        applicationStatus: "pending",
      });

      await service.create(userId, dto);

      expect(mockPrisma.application.upsert).toHaveBeenCalled();
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
    const candidateId = 5;
    const animalId = 10;

    it("doit archiver une demande (soft delete)", async () => {
      const fakeApp = {
        pfcUserId: candidateId,
        animalId: animalId,
        applicationStatus: "approved",
        deletedAt: null,
      };

      mockPrisma.application.findUnique.mockResolvedValue(fakeApp);
      mockPrisma.application.update.mockResolvedValue({ ...fakeApp, deletedAt: new Date() });

      const result = await service.remove(candidateId, animalId);

      expect(mockPrisma.application.findUnique).toHaveBeenCalled();
      expect(mockPrisma.application.update).toHaveBeenCalledWith({
        where: { pfcUserId_animalId: { pfcUserId: candidateId, animalId: animalId } },
        data: { deletedAt: expect.any(Date) },
      });
      expect(result.message).toContain("archivée");
    });

    it("doit échouer si la demande est toujours en attente (pending)", async () => {
      mockPrisma.application.findUnique.mockResolvedValue({
        pfcUserId: candidateId,
        animalId: animalId,
        applicationStatus: "pending",
        deletedAt: null,
      });

      await expect(service.remove(candidateId, animalId)).rejects.toThrow(
        "Impossible d'archiver une demande en attente"
      );
      expect(mockPrisma.application.update).not.toHaveBeenCalled();
    });

    it("doit échouer si la demande n'existe pas", async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);
      await expect(service.remove(candidateId, animalId)).rejects.toThrow(
        "Demande introuvable ou déjà supprimée"
      );
    });
  });

  describe("acceptApplication (Critical Business Flow)", () => {
    it("doit valider l'adoption, changer le statut de l'animal et rejeter les autres candidats de manière atomique", async () => {
      const candidateId = 5;
      const animalId = 10;
      const otherCandidateId = 99;

      const fakeApp = {
        pfcUserId: candidateId,
        animalId,
        applicationType: "adoption",
        user: { email: "winner@test.com" },
        animal: { id: animalId, name: "Rex" },
      };

      const pendingApps = [
        {
          pfcUserId: otherCandidateId,
          user: { email: "loser@test.com" },
          animal: { name: "Rex" },
        },
      ];

      // Mock des étapes de la transaction
      mockPrisma.animal.findUnique.mockResolvedValue({
        id: animalId,
        animalStatus: "available",
        deletedAt: null,
      });
      mockPrisma.application.updateMany.mockResolvedValue({ count: 1 });
      // On ajoute le mock pour findUniqueOrThrow qui est utilisé dans la transaction
      mockPrisma.application.findUniqueOrThrow = jest.fn().mockResolvedValue(fakeApp);
      mockPrisma.application.findMany.mockResolvedValue(pendingApps);

      const result = await service.acceptApplication(candidateId, animalId);

      // 1. Vérification de l'atomicité métier via transaction
      expect(mockPrisma.$transaction).toHaveBeenCalled();

      // 2. Vérification de la mise à jour de l'animal (Statut 'adopted' car applicationType = 'adoption')
      expect(mockPrisma.animal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: animalId },
          data: { animalStatus: "adopted" },
        })
      );

      // 3. Vérification du rejet en cascade des autres candidats
      expect(mockPrisma.application.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            animalId,
            pfcUserId: { not: candidateId },
            applicationStatus: "pending",
          }),
          data: { applicationStatus: "rejected" },
        })
      );

      expect(result.message).toContain("Candidature acceptée");
    });
  });

  describe("rejectApplication (Critical Business Flow)", () => {
    it("doit rejeter la candidature et envoyer un email de refus", async () => {
      const candidateId = 5;
      const animalId = 10;

      const fakeApp = {
        pfcUserId: candidateId,
        animalId,
        applicationStatus: "rejected",
        user: { email: "loser@test.com" },
        animal: { name: "Rex" },
      };

      // Simuler le fonctionnement interne de updateStatus utilisé par rejectApplication
      jest.spyOn(service, "updateStatus").mockResolvedValue(fakeApp as never);

      const result = await service.rejectApplication(candidateId, animalId);

      expect(service.updateStatus).toHaveBeenCalledWith(candidateId, animalId, {
        applicationStatus: "rejected",
      });
      expect(mockEmailsService.sendRejectionEmail).toHaveBeenCalledWith(
        "loser@test.com",
        "loser", // pseudo firstname extrait de l'email
        "Rex"
      );
      expect(result.message).toBe("Candidature refusée");
    });
  });

  describe("cancelOwn", () => {
    it("doit annuler sa propre demande", async () => {
      const candidateId = 5;
      const animalId = 10;

      mockPrisma.application.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.application.findUnique.mockResolvedValue({
        pfcUserId: candidateId,
        animalId,
        applicationStatus: "cancelled",
      });

      const result = await service.cancelOwn(candidateId, animalId);

      expect(mockPrisma.application.updateMany).toHaveBeenCalledWith({
        where: {
          pfcUserId: candidateId,
          animalId: animalId,
          deletedAt: null,
          applicationStatus: "pending",
        },
        data: { applicationStatus: "cancelled" },
      });
      expect(result).toEqual(
        expect.objectContaining({
          applicationStatus: "cancelled",
        })
      );
    });

    it("doit échouer si la demande n'est pas pending", async () => {
      mockPrisma.application.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.cancelOwn(5, 10)).rejects.toThrow(
        "Impossible d'annuler cette demande (déjà traitée ou annulée)."
      );
    });
  });
});
