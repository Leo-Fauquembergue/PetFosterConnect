import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import {
  ApplicationStatus,
  CreateApplicationDto,
  UpdateApplicationStatusDto,
} from "@projet/shared-types";
import { EmailsService } from "../emails/emails.service";
import { PrismaService } from "../prisma/prisma.service";

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
      // ⚡ RE-APPLY LOGIC : Si une demande annulée existe, on la réactive au lieu d'en créer une nouvelle
      return await this.prisma.application.upsert({
        where: {
          pfcUserId_animalId: {
            pfcUserId: userId,
            animalId: createDto.animalId,
          },
        },
        update: {
          applicationType: createDto.applicationType,
          message: createDto.message,
          applicationStatus: "pending", // On repasse en attente
          deletedAt: null, // On restaure si c'était soft-deleted
        },
        create: {
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
      where: { pfcUserId: userId }, // On ne filtre plus par deletedAt: null ici
      include: {
        animal: {
          include: {
            shelter: {
              select: {
                shelterProfile: {
                  select: { shelterName: true },
                },
              },
            },
          },
        },
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
          deletedAt: null,
        },
        deletedAt: null,
        // ⚡ FILTRE : Exclut explicitement les candidatures annulées
        applicationStatus: { notIn: ["cancelled"] },
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
      // On ne filtre plus par deletedAt pour que l'Admin voie tout l'historique
      include: {
        animal: {
          include: {
            shelter: {
              select: {
                shelterProfile: {
                  select: { shelterName: true },
                },
              },
            },
          },
        },
        user: {
          select: { id: true, email: true, phoneNumber: true, role: true, individualProfile: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateStatus(candidateId: number, animalId: number, updateDto: UpdateApplicationStatusDto) {
    const animal = await this.prisma.animal.findUnique({ where: { id: animalId } });

    if (!animal || animal.deletedAt) throw new NotFoundException("Animal introuvable ou supprimé");

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
      data: { applicationStatus: "cancelled" },
    });

    if (updateResult.count === 0) {
      throw new ConflictException("Impossible d'annuler cette demande (déjà traitée ou annulée).");
    }

    return this.prisma.application.findUnique({
      where: { pfcUserId_animalId: { pfcUserId: candidateId, animalId: animalId } },
    });
  }

  async remove(candidateId: number, animalId: number) {
    const application = await this.prisma.application.findUnique({
      where: { pfcUserId_animalId: { pfcUserId: candidateId, animalId: animalId } },
    });

    if (!application || application.deletedAt) {
      throw new NotFoundException("Demande introuvable ou déjà supprimée.");
    }

    if (application.applicationStatus === "pending") {
      throw new BadRequestException(
        "Impossible d'archiver une demande en attente. Veuillez l'accepter ou la refuser d'abord."
      );
    }

    await this.prisma.application.update({
      where: { pfcUserId_animalId: { pfcUserId: candidateId, animalId: animalId } },
      data: { deletedAt: new Date() },
    });

    return { message: "Demande archivée/supprimée avec succès" };
  }

  async acceptApplication(candidateId: number, animalId: number) {
    // 1. On regroupe les opérations BDD dans une transaction Serializable pour l'atomicité et l'isolation stricte
    const { application, pendingApplications } = await this.prisma.$transaction(
      async (tx) => {
        // Vérification et verrouillage de l'animal
        const animal = await tx.animal.findUnique({
          where: { id: animalId },
          select: { id: true, animalStatus: true, deletedAt: true },
        });

        if (!animal || animal.deletedAt)
          throw new NotFoundException("Animal introuvable ou supprimé");

        if (animal.animalStatus !== "available") {
          throw new ConflictException("Cet animal n'est plus disponible.");
        }

        // Mise à jour de la demande acceptée
        const appUpdateResult = await tx.application.updateMany({
          where: {
            pfcUserId: candidateId,
            animalId: animalId,
            deletedAt: null,
            applicationStatus: "pending",
          },
          data: { applicationStatus: "approved" },
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

        // Mise à jour du statut de l'animal
        const newAnimalStatus =
          updatedApp.applicationType === "adoption" ? "adopted" : "foster_care";
        await tx.animal.update({
          where: { id: animalId },
          data: { animalStatus: newAnimalStatus },
        });

        // Récupération des candidats à refuser avant de modifier leur statut
        const pendingApps = await tx.application.findMany({
          where: {
            animalId: animalId,
            pfcUserId: { not: candidateId },
            applicationStatus: "pending",
            // On ne filtre pas par deletedAt ici pour être sûr de tout traiter
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
            applicationStatus: "pending",
          },
          data: { applicationStatus: "rejected" },
        });

        return { application: updatedApp, pendingApplications: pendingApps };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    // 2. Envoi des emails (non-bloquant)
    const emailPromises = [
      (async () => {
        if (!application.user?.email) return;
        try {
          const recipientName = application.user.email.split("@")[0] || "Candidat";
          await this.emailsService.sendAcceptanceEmail(
            application.user.email,
            recipientName,
            application.animal.name
          );
        } catch (error: unknown) {
          this.logger.error(`⚠️ [Email Error] Acceptation à ${application.user.email} : ${error}`);
        }
      })(),
      ...pendingApplications.map(async (rejectedApp) => {
        if (!rejectedApp.user?.email) return;
        try {
          const recipientName = rejectedApp.user.email.split("@")[0] || "Candidat";
          await this.emailsService.sendRejectionEmail(
            rejectedApp.user.email,
            recipientName,
            rejectedApp.animal.name
          );
        } catch (error: unknown) {
          this.logger.error(`⚠️ [Email Error] Rejet à ${rejectedApp.user.email} : ${error}`);
        }
      }),
    ];

    Promise.allSettled(emailPromises);

    return {
      message: "Candidature acceptée (Notifications en cours d'envoi)",
      application,
    };
  }

  async rejectApplication(candidateId: number, animalId: number) {
    const application = await this.updateStatus(candidateId, animalId, {
      applicationStatus: "rejected",
    });

    if (!application) {
      throw new NotFoundException("Candidature introuvable post-rejet.");
    }

    try {
      if (application.user?.email) {
        // 🛡️ FIX : firstname n'existe pas dans le schéma actuel
        const recipientName = application.user.email.split("@")[0] || "Candidat";
        await this.emailsService.sendRejectionEmail(
          application.user.email,
          recipientName,
          application.animal.name
        );
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur inconnue";
      this.logger.error(`⚠️ [Email Error] Impossible d'envoyer l'email de refus : ${msg}`);
    }

    return { message: "Candidature refusée", application };
  }
}
