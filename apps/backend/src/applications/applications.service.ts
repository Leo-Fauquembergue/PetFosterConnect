import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { RequestWithUser } from "@projet/shared-types";
import {
  ApplicationStatus,
  CreateApplicationDto,
  UpdateApplicationStatusDto,
} from "@projet/shared-types";
import { EmailsService } from "../emails/emails.service";
import { PrismaService } from "../prisma/prisma.service";

type UserPayload = RequestWithUser["user"];

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    private prisma: PrismaService,
    private emailsService: EmailsService
  ) {}

  async create(userId: number, createDto: CreateApplicationDto) {
    try {
      return await this.prisma.application.create({
        data: {
          pfcUserId: userId,
          animalId: createDto.animalId,
          applicationType: createDto.applicationType,
          message: createDto.message,
        },
        include: { animal: true },
      });
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw new ConflictException("Vous avez déjà envoyé une demande pour cet animal.");
        }
      }
      throw error;
    }
  }

  findAllSent(userId: number) {
    return this.prisma.application.findMany({
      where: { pfcUserId: userId, deletedAt: null },
      include: {
        animal: true,
        user: { select: { id: true, email: true, phoneNumber: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findAllReceived(shelterId: number) {
    return this.prisma.application.findMany({
      where: { animal: { pfcUserId: shelterId }, deletedAt: null },
      select: {
        pfcUserId: true,
        animalId: true,
        message: true,
        applicationType: true,
        applicationStatus: true,
        createdAt: true,
        user: {
          select: { id: true, email: true, phoneNumber: true, individualProfile: true },
        },
        animal: { select: { id: true, name: true, photos: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Route Admin restaurée précédemment
  findAll() {
    return this.prisma.application.findMany({
      include: {
        animal: true,
        user: {
          include: { individualProfile: true },
        },
      },
    });
  }

  async updateStatus(
    candidateId: number,
    animalId: number,
    updateDto: UpdateApplicationStatusDto,
    user: UserPayload
  ) {
    const animal = await this.prisma.animal.findUnique({ where: { id: animalId } });

    if (!animal) throw new NotFoundException("Animal introuvable");

    this.checkOwnership(animal.pfcUserId, user, "Vous ne gérez pas cet animal.");

    return this.prisma.application.update({
      where: { pfcUserId_animalId: { pfcUserId: candidateId, animalId: animalId } },
      data: { applicationStatus: updateDto.applicationStatus as ApplicationStatus },
      include: {
        user: { select: { id: true, email: true, individualProfile: true } },
        animal: { select: { id: true, name: true, photos: true } },
      },
    });
  }

  async remove(candidateId: number, animalId: number, user: UserPayload) {
    const animal = await this.prisma.animal.findUnique({ where: { id: animalId } });

    if (!animal) throw new NotFoundException("Animal introuvable");

    this.checkOwnership(animal.pfcUserId, user, "Vous ne gérez pas cet animal.");

    return this.prisma.application.update({
      where: { pfcUserId_animalId: { pfcUserId: candidateId, animalId: animalId } },
      data: { deletedAt: new Date() },
    });
  }

  async acceptApplication(candidateId: number, animalId: number, user: UserPayload) {
    // 1. On regroupe les opérations BDD dans une transaction pour l'atomicité
    const { application, pendingApplications } = await this.prisma.$transaction(async (tx) => {
      // Vérification IDOR (logique extraite de updateStatus pour être dans la transaction)
      const animal = await tx.animal.findUnique({ where: { id: animalId } });
      if (!animal) throw new NotFoundException("Animal introuvable");
      this.checkOwnership(animal.pfcUserId, user, "Vous ne gérez pas cet animal.");

      // Mise à jour de la demande acceptée
      const updatedApp = await tx.application.update({
        where: { pfcUserId_animalId: { pfcUserId: candidateId, animalId: animalId } },
        data: { applicationStatus: "approved" as ApplicationStatus },
        include: {
          user: { select: { id: true, email: true, individualProfile: true } },
          animal: { select: { id: true, name: true, photos: true } },
        },
      });

      // Mise à jour du statut de l'animal
      const newAnimalStatus = updatedApp.applicationType === "adoption" ? "adopted" : "foster_care";
      await tx.animal.update({
        where: { id: animalId },
        data: { animalStatus: newAnimalStatus },
      });

      // Récupération des candidats à refuser avant de modifier leur statut
      const pendingApps = await tx.application.findMany({
        where: {
          animalId: animalId,
          pfcUserId: { not: candidateId },
          applicationStatus: "pending" as ApplicationStatus,
        },
        include: {
          user: { select: { email: true, individualProfile: true } },
          animal: { select: { name: true } },
        },
      });

      // Refus automatique des autres demandes
      await tx.application.updateMany({
        where: {
          animalId: animalId,
          pfcUserId: { not: candidateId },
          applicationStatus: "pending" as ApplicationStatus,
        },
        data: { applicationStatus: "rejected" as ApplicationStatus },
      });

      return { application: updatedApp, pendingApplications: pendingApps };
    });

    // 2. Envoi des emails en parallèle via Promise.allSettled (non-bloquant)
    const emailPromises = [
      // Notification d'acceptation
      (async () => {
        if (!application.user?.email) return;
        try {
          const firstname =
            (application.user.individualProfile as { firstname?: string })?.firstname || "Candidat";
          await this.emailsService.sendAcceptanceEmail(
            application.user.email,
            firstname,
            application.animal.name
          );
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : "Erreur inconnue";
          this.logger.error(`⚠️ [Email Error] Acceptation à ${application.user.email} : ${msg}`);
        }
      })(),
      // Notifications de refus
      ...pendingApplications.map(async (rejectedApp) => {
        if (!rejectedApp.user?.email) return;
        try {
          const firstname =
            (rejectedApp.user.individualProfile as { firstname?: string })?.firstname || "Candidat";
          await this.emailsService.sendRejectionEmail(
            rejectedApp.user.email,
            firstname,
            rejectedApp.animal.name
          );
        } catch (error: unknown) {
          const msg = error instanceof Error ? error.message : "Erreur inconnue";
          this.logger.error(`⚠️ [Email Error] Rejet à ${rejectedApp.user.email} : ${msg}`);
        }
      }),
    ];

    // Exécution parallèle sans bloquer la réponse de l'API
    Promise.allSettled(emailPromises);

    return {
      message: "Candidature acceptée (Notifications en cours d'envoi)",
      application,
    };
  }

  async rejectApplication(candidateId: number, animalId: number, user: UserPayload) {
    const application = await this.updateStatus(
      candidateId,
      animalId,
      {
        applicationStatus: "rejected",
      },
      user
    );

    try {
      if (application.user?.email) {
        const firstname =
          (application.user.individualProfile as { firstname?: string })?.firstname || "Candidat";
        await this.emailsService.sendRejectionEmail(
          application.user.email,
          firstname,
          application.animal.name
        );
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur inconnue";
      this.logger.error(`⚠️ [Email Error] Impossible d'envoyer l'email de refus : ${msg}`);
    }

    return { message: "Candidature refusée", application };
  }

  /**
   * Vérifie si l'utilisateur est admin ou le propriétaire de la ressource.
   * Empêche les attaques IDOR.
   */
  private checkOwnership(ownerId: number, user: UserPayload, message: string) {
    if (user.role !== "admin" && ownerId !== user.id) {
      throw new ForbiddenException(message);
    }
  }
}
