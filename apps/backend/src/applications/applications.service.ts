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

    // Vérification IDOR stricte
    if (user.role !== "admin" && animal.pfcUserId !== user.id) {
      throw new ForbiddenException("Vous ne gérez pas cet animal.");
    }

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

    // Vérification IDOR stricte
    if (user.role !== "admin" && animal.pfcUserId !== user.id) {
      throw new ForbiddenException("Vous ne gérez pas cet animal.");
    }

    return this.prisma.application.update({
      where: { pfcUserId_animalId: { pfcUserId: candidateId, animalId: animalId } },
      data: { deletedAt: new Date() },
    });
  }

  async acceptApplication(candidateId: number, animalId: number, user: UserPayload) {
    // 1. On accepte la demande
    const application = await this.updateStatus(
      candidateId,
      animalId,
      {
        applicationStatus: "approved",
      },
      user
    );

    // 2. ⚡ LOGIQUE MÉTIER AJOUTÉE : On met à jour le statut de l'animal
    const newAnimalStatus = application.applicationType === "adoption" ? "adopted" : "foster_care";

    await this.prisma.animal.update({
      where: { id: animalId },
      data: { animalStatus: newAnimalStatus },
    });

    // 3. ⚡ CORRECTION : On récupère les candidats à refuser AVANT de modifier la base
    const pendingApplications = await this.prisma.application.findMany({
      where: {
        animalId: animalId,
        pfcUserId: { not: candidateId },
        applicationStatus: "pending",
      },
      include: {
        user: { select: { email: true, individualProfile: true } },
        animal: { select: { name: true } },
      },
    });

    // On refuse automatiquement en BDD toutes les autres demandes en attente pour cet animal
    await this.prisma.application.updateMany({
      where: {
        animalId: animalId,
        pfcUserId: { not: candidateId },
        applicationStatus: "pending",
      },
      data: { applicationStatus: "rejected" },
    });

    // ⚡ FIX : Envoi des emails de refus aux candidats (fin du silence radio)
    for (const rejectedApp of pendingApplications) {
      try {
        if (rejectedApp.user?.email) {
          const firstname =
            (rejectedApp.user.individualProfile as { firstname?: string })?.firstname || "Candidat";
          await this.emailsService.sendRejectionEmail(
            rejectedApp.user.email,
            firstname,
            rejectedApp.animal.name
          );
        }
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : "Erreur inconnue";
        this.logger.error(
          `⚠️ [Email Error] Impossible d'envoyer l'email de refus à ${rejectedApp.user.email} : ${msg}`
        );
      }
    }

    // 4. Envoi de l'email au candidat victorieux
    try {
      if (application.user?.email) {
        const firstname =
          (application.user.individualProfile as { firstname?: string })?.firstname || "Candidat";
        await this.emailsService.sendAcceptanceEmail(
          application.user.email,
          firstname,
          application.animal.name
        );
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur inconnue";
      this.logger.error(`⚠️ [Email Error] Impossible d'envoyer l'email d'acceptation : ${msg}`);
    }

    return {
      message: "Candidature acceptée (Notification email traitée pour tous les candidats)",
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
}
