import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import type { RequestWithUser } from "@projet/shared-types";
import * as sharedTypes from "@projet/shared-types";
import { CheckOwner } from "../auth/decorators/check-owner.decorator";
import { Roles } from "../auth/decorators/roles.decorators";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ResourceOwnerGuard } from "../auth/guards/resource-owner.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ZodPipe } from "../common/pipes/zod.pipe";
import { IdSchema } from "../common/schemas/params.schema";
import { ApplicationsService } from "./applications.service";

@ApiTags("applications")
@Controller("applications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.individual)
  @ApiOperation({ summary: "Créer une demande d'adoption" })
  @ApiResponse({ status: 201, description: "Demande créée avec succès" })
  create(
    @Req() req: RequestWithUser,
    @Body(new ZodPipe(sharedTypes.CreateApplicationSchema))
    createApplicationDto: sharedTypes.CreateApplicationDto
  ) {
    return this.applicationsService.create(req.user.id, createApplicationDto);
  }

  // ⚡ CORRECTION: Retour aux endpoints "sent" et "received" attendus par le Frontend
  @Get("sent")
  @ApiOperation({ summary: "Récupérer les demandes d'adoption envoyées par le candidat connecté" })
  findAllSent(@Req() req: RequestWithUser) {
    return this.applicationsService.findAllSent(req.user.id);
  }

  @Get("received")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.shelter, UserRole.admin)
  @ApiOperation({ summary: "Récupérer les demandes reçues par le refuge connecté" })
  findAllReceived(@Req() req: RequestWithUser) {
    return this.applicationsService.findAllReceived(req.user.id);
  }

  // ⚡ AJOUT: Route Admin globale
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiOperation({ summary: "Récupérer l'intégralité des demandes (Admin)" })
  findAll() {
    return this.applicationsService.findAll();
  }

  @Patch(":animalId/:candidateId/status")
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
  @Roles(UserRole.shelter, UserRole.admin)
  @CheckOwner({ type: "animal", idParam: "animalId" })
  @ApiOperation({ summary: "Mettre à jour le statut d'une demande" })
  update(
    @Param("animalId", new ZodPipe(IdSchema)) animalId: number,
    @Param("candidateId", new ZodPipe(IdSchema)) candidateId: number,
    @Body(new ZodPipe(sharedTypes.UpdateApplicationStatusSchema))
    updateDto: sharedTypes.UpdateApplicationStatusDto
  ) {
    return this.applicationsService.updateStatus(candidateId, animalId, updateDto);
  }

  @Delete("me/:animalId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.individual)
  @ApiOperation({ summary: "Annuler sa propre demande d'adoption" })
  cancelOwn(
    @Req() req: RequestWithUser,
    @Param("animalId", new ZodPipe(IdSchema)) animalId: number
  ) {
    return this.applicationsService.cancelOwn(req.user.id, animalId);
  }

  @Delete(":animalId/:candidateId")
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
  @Roles(UserRole.shelter, UserRole.admin)
  @CheckOwner({ type: "animal", idParam: "animalId" })
  @ApiOperation({ summary: "Archiver / Supprimer une demande" })
  remove(
    @Param("animalId", new ZodPipe(IdSchema)) animalId: number,
    @Param("candidateId", new ZodPipe(IdSchema)) candidateId: number
  ) {
    return this.applicationsService.remove(candidateId, animalId);
  }
}
