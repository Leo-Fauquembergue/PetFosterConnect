import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ParseIntPipe,
  UseGuards,
  Request,
  Logger
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import { ApplicationStatus } from "@prisma/client";
import * as sharedTypes from "@projet/shared-types";
import { JwtAuthGuard } from "../auth/auth.guard";
import { ZodPipe } from "../common/pipes/zod.pipe";
import { EmailService } from "../email/email.service";
import { ApplicationsService } from "./applications.service";

@ApiTags("applications")
@Controller("applications")
// Toutes les routes nécessitent d'être connecté
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApplicationsController {
  // Instanciation du Logger
  private readonly logger = new Logger(ApplicationsController.name);

  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly emailService: EmailService
  ) {}

  // CANDIDAT

  // Créer une demande
  @Post()
  @ApiOperation({ summary: "Créer une demande d'adoption" })
  @ApiResponse({ status: 201, description: "Demande créée avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 401, description: "Non authentifié" })
  @UsePipes(new ZodPipe(sharedTypes.CreateApplicationSchema))
  create(
    @Request() req,
    @Body() createApplicationDto: sharedTypes.CreateApplicationDto
  ) {
    // req.user.id est extrait automatiquement du Token
    return this.applicationsService.create(req.user.id, createApplicationDto);
  }

  // Mes demandes envoyées
  @Get("sent")
  @ApiOperation({ summary: "Récupérer mes demandes d'adoption envoyées" })
  @ApiResponse({
    status: 200,
    description: "Liste des demandes envoyées retournée avec succès",
  })
  @ApiResponse({ status: 401, description: "Non authentifié" })
  findAllSent(@Request() req) {
    return this.applicationsService.findAllSent(req.user.id);
  }

  // REFUGE

  // Demandes reçues par le refuge
  @Get("received")
  @ApiOperation({
    summary: "Récupérer les demandes d'adoption reçues par mon refuge",
  })
  @ApiResponse({
    status: 200,
    description: "Liste des demandes reçues retournée avec succès",
  })
  @ApiResponse({ status: 401, description: "Non authentifié" })
  findAllReceived(@Request() req) {
    return this.applicationsService.findAllReceived(req.user.id);
  }

  // GESTION (Refuge)

  // Accepter/Refuser (Mise à jour statut générique)
  @Patch(":animalId/:candidateId")
  @ApiOperation({ summary: "Mettre à jour le statut d'une demande d'adoption" })
  @ApiParam({ name: "animalId", description: "ID de l'animal", type: Number })
  @ApiParam({
    name: "candidateId",
    description: "ID du candidat",
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: "Statut de la demande mis à jour avec succès",
  })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 404, description: "Demande non trouvée" })
  @ApiResponse({ status: 401, description: "Non authentifié" })
  @UsePipes(new ZodPipe(sharedTypes.UpdateApplicationStatusSchema))
  update(
    @Param("animalId", ParseIntPipe) animalId: number,
    @Param("candidateId", ParseIntPipe) candidateId: number,
    @Body() updateDto: sharedTypes.UpdateApplicationStatusDto
  ) {
    return this.applicationsService.updateStatus(
      candidateId,
      animalId,
      updateDto
    );
  }

  // Archiver / Supprimer
  @Delete(":animalId/:candidateId")
  @ApiOperation({ summary: "Supprimer une demande d'adoption" })
  @ApiParam({ name: "animalId", description: "ID de l'animal", type: Number })
  @ApiParam({
    name: "candidateId",
    description: "ID du candidat",
    type: Number,
  })
  @ApiResponse({ status: 200, description: "Demande supprimée avec succès" })
  @ApiResponse({ status: 404, description: "Demande non trouvée" })
  @ApiResponse({ status: 401, description: "Non authentifié" })
  remove(
    @Param("animalId", ParseIntPipe) animalId: number,
    @Param("candidateId", ParseIntPipe) candidateId: number
  ) {
    return this.applicationsService.remove(candidateId, animalId);
  }

  // Raccourci : Accepter
  @Post(":candidateId/:animalId/accept")
  @ApiOperation({ summary: "Accepter une demande d'adoption" })
  @ApiParam({
    name: "candidateId",
    description: "ID du candidat",
    type: Number,
  })
  @ApiParam({ name: "animalId", description: "ID de l'animal", type: Number })
  @ApiResponse({
    status: 201,
    description: "Demande acceptée avec succès et email envoyé",
  })
  @ApiResponse({ status: 404, description: "Demande non trouvée" })
  @ApiResponse({ status: 401, description: "Non authentifié" })
  async accept(
    @Param("candidateId", ParseIntPipe) candidateId: number,
    @Param("animalId", ParseIntPipe) animalId: number
  ) {
    // D'abord, on met à jour la base de données (C'est le plus important)
    const application = await this.applicationsService.updateStatus(
      candidateId,
      animalId,
      {
        applicationStatus: ApplicationStatus.approved,
      }
    );

    // Ensuite, on tente d'envoyer l'email (Non bloquant)
    try {
      if (application.user?.email) {
        // Astuce : On utilise une valeur de secours si le prénom n'est pas dispo
        const firstname =
          (application.user.individualProfile as any)?.firstname || "Candidat";

        await this.emailService.sendAcceptanceEmail(
          application.user.email,
          firstname,
          application.animal.name
        );
      }
    } catch (error: any) {
      // Si l'email plante (ex: pas de SMTP), on loggue l'erreur mais on ne casse pas la requête
      this.logger.error(
        `⚠️ [Email Error] Impossible d'envoyer l'email d'acceptation : ${error.message}`
      );
    }

    // On renvoie quand même le succès au front, car la mise à jour BDD est faite
    return {
      message: "Candidature acceptée (Notification email traitée)",
      application,
    };
  }

  // Raccourci : Refuser
  @Post(":candidateId/:animalId/reject")
  @ApiOperation({ summary: "Refuser une demande d'adoption" })
  @ApiParam({
    name: "candidateId",
    description: "ID du candidat",
    type: Number,
  })
  @ApiParam({ name: "animalId", description: "ID de l'animal", type: Number })
  @ApiResponse({
    status: 201,
    description: "Demande refusée avec succès et email envoyé",
  })
  @ApiResponse({ status: 404, description: "Demande non trouvée" })
  @ApiResponse({ status: 401, description: "Non authentifié" })
  async reject(
    @Param("candidateId", ParseIntPipe) candidateId: number,
    @Param("animalId", ParseIntPipe) animalId: number
  ) {
    const application = await this.applicationsService.updateStatus(
      candidateId,
      animalId,
      {
        applicationStatus: ApplicationStatus.rejected,
      }
    );

    // Protection anti-crash pour l'email
    try {
      if (application.user?.email) {
        const firstname =
          (application.user.individualProfile as any)?.firstname || "Candidat";

        await this.emailService.sendRejectionEmail(
          application.user.email,
          firstname,
          application.animal.name
        );
      }
    } catch (error: any) {
      this.logger.error(
        `⚠️ [Email Error] Impossible d'envoyer l'email de refus : ${error.message}`
      );
    }

    return { message: "Candidature refusée", application };
  }
}
