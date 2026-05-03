import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import type { RequestWithUser } from "@projet/shared-types";
import * as sharedTypes from "@projet/shared-types";
import { Roles } from "../auth/decorators/roles.decorators";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
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
  @UseGuards(RolesGuard)
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
  @UseGuards(RolesGuard)
  @Roles(UserRole.shelter, UserRole.admin)
  @ApiOperation({ summary: "Récupérer les demandes reçues par le refuge connecté" })
  findAllReceived(@Req() req: RequestWithUser) {
    return this.applicationsService.findAllReceived(req.user.id);
  }

  // ⚡ AJOUT: Route Admin globale
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  @ApiOperation({ summary: "Récupérer l'intégralité des demandes (Admin)" })
  findAll() {
    return this.applicationsService.findAll();
  }

  @Patch(":animalId/:candidateId/status")
  @UseGuards(RolesGuard)
  @Roles(UserRole.shelter, UserRole.admin)
  @ApiOperation({ summary: "Mettre à jour le statut d'une demande" })
  update(
    @Req() req: RequestWithUser,
    @Param("animalId", new ZodPipe(IdSchema)) animalId: number,
    @Param("candidateId", new ZodPipe(IdSchema)) candidateId: number,
    @Body(new ZodPipe(sharedTypes.UpdateApplicationStatusSchema))
    updateDto: sharedTypes.UpdateApplicationStatusDto
  ) {
    return this.applicationsService.updateStatus(candidateId, animalId, updateDto, req.user);
  }

  @Delete("me/:animalId")
  @UseGuards(RolesGuard)
  @Roles(UserRole.individual)
  @ApiOperation({ summary: "Annuler sa propre demande d'adoption" })
  cancelOwn(
    @Req() req: RequestWithUser,
    @Param("animalId", new ZodPipe(IdSchema)) animalId: number
  ) {
    return this.applicationsService.cancelOwn(req.user.id, animalId);
  }

  @Delete(":animalId/:candidateId")
  @UseGuards(RolesGuard)
  @Roles(UserRole.shelter, UserRole.admin)
  @ApiOperation({ summary: "Archiver / Supprimer une demande" })
  remove(
    @Req() req: RequestWithUser,
    @Param("animalId", new ZodPipe(IdSchema)) animalId: number,
    @Param("candidateId", new ZodPipe(IdSchema)) candidateId: number
  ) {
    return this.applicationsService.remove(candidateId, animalId, req.user);
  }

  @Post(":candidateId/:animalId/accept")
  @UseGuards(RolesGuard)
  @Roles(UserRole.shelter, UserRole.admin)
  @ApiOperation({ summary: "Accepter formellement une demande" })
  async accept(
    @Req() req: RequestWithUser,
    @Param("candidateId", new ZodPipe(IdSchema)) candidateId: number,
    @Param("animalId", new ZodPipe(IdSchema)) animalId: number
  ) {
    return this.applicationsService.acceptApplication(candidateId, animalId, req.user);
  }

  @Post(":candidateId/:animalId/reject")
  @UseGuards(RolesGuard)
  @Roles(UserRole.shelter, UserRole.admin)
  @ApiOperation({ summary: "Refuser formellement une demande" })
  async reject(
    @Req() req: RequestWithUser,
    @Param("candidateId", new ZodPipe(IdSchema)) candidateId: number,
    @Param("animalId", new ZodPipe(IdSchema)) animalId: number
  ) {
    return this.applicationsService.rejectApplication(candidateId, animalId, req.user);
  }
}
