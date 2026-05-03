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
    const animal = await this.prisma.animal.findUnique({
      where: { id: createDto.animalId },
      select: { deletedAt: true, animalStatus: true },
    });

    if (!animal || animal.deletedAt) {
      throw new NotFoundException("Animal introuvable ou supprimé.");
    }

    if (animal.animalStatus !== "available") {
      throw new ConflictException("Cet animal n'est plus disponible pour une candidature.");
    }

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
      where: {
        animal: {
          pfcUserId: shelterId,
          deletedAt: null, // 🛡️ FILTRE : Exclut les candidatures pour animaux supprimés
        },
        deletedAt: null,
      },
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
          select: { id: true, email: true, phoneNumber: true, role: true, individualProfile: true },
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

    if (!animal || animal.deletedAt) throw new NotFoundException("Animal introuvable ou supprimé");

    this.checkOwnership(animal.pfcUserId, user, "Vous ne gérez pas cet animal.");

    // Empêcher de mettre à jour une candidature supprimée (ou déjà approuvée si on rejette)
    const updateResult = await this.prisma.application.updateMany({
      where: {
        pfcUserId: candidateId,
        animalId: animalId,
        deletedAt: null,
        applicationStatus: "pending", // On ne peut changer le statut que si elle est en attente
      },
      data: { applicationStatus: updateDto.applicationStatus as ApplicationStatus },
    });

    if (updateResult.count === 0) {
      throw new ConflictException("Candidature introuvable, déjà traitée ou annulée.");
    }

    return this.prisma.application.findUnique({
      where: { pfcUserId_animalId: { pfcUserId: candidateId, animalId: animalId } },
      include: {
        user: { select: { id: true, email: true, individualProfile: true } },
        animal: { select: { id: true, name: true, photos: true } },
      },
    });
  }

  async cancelOwn(candidateId: number, animalId: number) {
    // Un utilisateur ne peut annuler que si la demande est toujours 'pending'
    const updateResult = await this.prisma.application.updateMany({
      where: {
        pfcUserId: candidateId,
        animalId: animalId,
        deletedAt: null,
        applicationStatus: "pending",
      },
      data: { deletedAt: new Date() },
    });

    if (updateResult.count === 0) {
      throw new ConflictException("Impossible d'annuler cette demande (déjà traitée ou annulée).");
    }

    return { message: "Demande annulée avec succès" };
  }

  async remove(candidateId: number, animalId: number, user: UserPayload) {
    const animal = await this.prisma.animal.findUnique({ where: { id: animalId } });

    if (!animal || animal.deletedAt) throw new NotFoundException("Animal introuvable ou supprimé");

    this.checkOwnership(animal.pfcUserId, user, "Vous ne gérez pas cet animal.");

    const updateResult = await this.prisma.application.updateMany({
      where: {
        pfcUserId: candidateId,
        animalId: animalId,
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });

    if (updateResult.count === 0) {
      throw new NotFoundException("Demande introuvable ou déjà supprimée.");
    }

    return { message: "Demande archivée/supprimée avec succès" };
  }

  async acceptApplication(candidateId: number, animalId: number, user: UserPayload) {
    // 1. On regroupe les opérations BDD dans une transaction pour l'atomicité
    const { application, pendingApplications } = await this.prisma.$transaction(async (tx) => {
      // Vérification IDOR (logique extraite de updateStatus pour être dans la transaction)
      const animal = await tx.animal.findUnique({ where: { id: animalId } });
      if (!animal || animal.deletedAt)
        throw new NotFoundException("Animal introuvable ou supprimé");
      this.checkOwnership(animal.pfcUserId, user, "Vous ne gérez pas cet animal.");

      // Mise à jour de la demande acceptée via un verrou optimiste
      const appUpdateResult = await tx.application.updateMany({
        where: {
          pfcUserId: candidateId,
          animalId: animalId,
          deletedAt: null, // S'assure qu'elle n'a pas été annulée entre-temps
          applicationStatus: "pending", // S'assure qu'elle est toujours en attente
        },
        data: { applicationStatus: "approved" as ApplicationStatus },
      });

      if (appUpdateResult.count === 0) {
        throw new ConflictException(
          "Cette candidature n'est plus valide (annulée ou déjà traitée)."
        );
      }

      // Récupération de l'application modifiée pour la suite
      const updatedApp = await tx.application.findUniqueOrThrow({
        where: { pfcUserId_animalId: { pfcUserId: candidateId, animalId: animalId } },
        include: {
          user: { select: { id: true, email: true, individualProfile: true } },
          animal: { select: { id: true, name: true, photos: true } },
        },
      });

      // Mise à jour conditionnelle du statut de l'animal (Optimistic Concurrency Control)
      // Empêche d'écraser une adoption concurrente grâce au verrou de ligne (Row-Level Lock) de PostgreSQL
      const newAnimalStatus = updatedApp.applicationType === "adoption" ? "adopted" : "foster_care";
      const animalUpdateResult = await tx.animal.updateMany({
        where: {
          id: animalId,
          animalStatus: "available",
        },
        data: { animalStatus: newAnimalStatus },
      });

      if (animalUpdateResult.count === 0) {
        throw new ConflictException("Cet animal a déjà été adopté ou placé entre-temps.");
      }

      // Récupération des candidats à refuser avant de modifier leur statut
      const pendingApps = await tx.application.findMany({
        where: {
          animalId: animalId,
          pfcUserId: { not: candidateId },
          applicationStatus: "pending" as ApplicationStatus,
          deletedAt: null,
        },
        include: {
          user: { select: { email: true, individualProfile: true } },
          animal: { select: { name: true } },
        },
      });

      // Refus automatique des autres demandes en attente
      await tx.application.updateMany({
        where: {
          animalId: animalId,
          pfcUserId: { not: candidateId },
          applicationStatus: "pending" as ApplicationStatus,
          deletedAt: null,
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

    if (!application) {
      throw new NotFoundException("Candidature introuvable post-rejet.");
    }

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
