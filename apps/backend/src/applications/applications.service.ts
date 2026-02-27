import { Injectable, ConflictException, Logger } from '@nestjs/common';
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

  async updateStatus(candidateId: number, animalId: number, updateDto: UpdateApplicationStatusDto) {
    return this.prisma.application.update({
      where: { pfcUserId_animalId: { pfcUserId: candidateId, animalId: animalId } },
      data: { applicationStatus: updateDto.applicationStatus as ApplicationStatus },
      include: {
        user: { select: { id: true, email: true, individualProfile: true } },
        animal: { select: { id: true, name: true, photos: true } },
      },
    });
  }

  remove(candidateId: number, animalId: number) {
    return this.prisma.application.update({
      where: { pfcUserId_animalId: { pfcUserId: candidateId, animalId: animalId } },
      data: { deletedAt: new Date() },
    });
  }

  async acceptApplication(candidateId: number, animalId: number) {
    const application = await this.updateStatus(candidateId, animalId, {
      applicationStatus: "approved",
    });

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

  async rejectApplication(candidateId: number, animalId: number) {
    const application = await this.updateStatus(candidateId, animalId, {
      applicationStatus: "rejected",
    });

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