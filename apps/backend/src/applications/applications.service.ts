import { Injectable, ConflictException, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus, CreateApplicationDto, UpdateApplicationStatusDto } from '@projet/shared-types';
import { Prisma } from '@prisma/client';
import { EmailsService } from '../emails/emails.service';

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
        include: { animal: true }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Vous avez déjà envoyé une demande pour cet animal.');
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
          include: { individualProfile: true }
        }
      }
    });
  }

  async updateStatus(candidateId: number, animalId: number, updateDto: UpdateApplicationStatusDto, user: any) {
    const animal = await this.prisma.animal.findUnique({ where: { id: animalId } });
    if (!animal) throw new NotFoundException("Animal introuvable");
    
    // Vérification IDOR stricte
    if (user.role !== 'admin' && animal.pfcUserId !== user.id) {
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

  async remove(candidateId: number, animalId: number, user: any) {
    const animal = await this.prisma.animal.findUnique({ where: { id: animalId } });
    if (!animal) throw new NotFoundException("Animal introuvable");
    
    // Vérification IDOR stricte
    if (user.role !== 'admin' && animal.pfcUserId !== user.id) {
      throw new ForbiddenException("Vous ne gérez pas cet animal.");
    }

    return this.prisma.application.update({
      where: { pfcUserId_animalId: { pfcUserId: candidateId, animalId: animalId } },
      data: { deletedAt: new Date() },
    });
  }

  async acceptApplication(candidateId: number, animalId: number, user: any) {
    // 1. On accepte la demande
    const application = await this.updateStatus(candidateId, animalId, {
      applicationStatus: "approved",
    }, user);

    // 2. ⚡ LOGIQUE MÉTIER AJOUTÉE : On met à jour le statut de l'animal
    const newAnimalStatus = application.applicationType === "adoption" ? "adopted" : "foster_care";
    
    await this.prisma.animal.update({
      where: { id: animalId },
      data: { animalStatus: newAnimalStatus }
    });

    // 3. ⚡ LOGIQUE MÉTIER AJOUTÉE : On refuse automatiquement toutes les autres demandes en attente pour cet animal
    await this.prisma.application.updateMany({
      where: { 
        animalId: animalId, 
        pfcUserId: { not: candidateId },
        applicationStatus: "pending" 
      },
      data: { applicationStatus: "rejected" }
    });

    // 4. Envoi de l'email
    try {
      if (application.user?.email) {
        const firstname = (application.user.individualProfile as any)?.firstname || "Candidat";
        await this.emailsService.sendAcceptanceEmail(application.user.email, firstname, application.animal.name);
      }
    } catch (error: any) {
      this.logger.error(`⚠️ [Email Error] Impossible d'envoyer l'email d'acceptation : ${error.message}`);
    }

    return { message: "Candidature acceptée (Notification email traitée)", application };
  }

  async rejectApplication(candidateId: number, animalId: number, user: any) {
    const application = await this.updateStatus(candidateId, animalId, {
      applicationStatus: "rejected",
    }, user);

    try {
      if (application.user?.email) {
        const firstname = (application.user.individualProfile as any)?.firstname || "Candidat";
        await this.emailsService.sendRejectionEmail(application.user.email, firstname, application.animal.name);
      }
    } catch (error: any) {
      this.logger.error(`⚠️ [Email Error] Impossible d'envoyer l'email de refus : ${error.message}`);
    }

    return { message: "Candidature refusée", application };
  }
}