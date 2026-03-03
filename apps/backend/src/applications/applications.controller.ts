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
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from "@nestjs/swagger";
import * as sharedTypes from "@projet/shared-types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ProfileAccessGuard } from "../auth/guards/profile-access.guard";
import { Roles } from "../auth/decorators/roles.decorators";
import { UserRole } from "@prisma/client";
import { ZodPipe } from "../common/pipes/zod.pipe";
import { ApplicationsService } from "./applications.service";

@ApiTags("applications")
@Controller("applications")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: "Créer une demande d'adoption" })
  @ApiResponse({ status: 201, description: "Demande créée avec succès" })
  @UsePipes(new ZodPipe(sharedTypes.CreateApplicationSchema))
  create(
    @Request() req,
    @Body() createApplicationDto: sharedTypes.CreateApplicationDto
  ) {
    return this.applicationsService.create(req.user.id, createApplicationDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  @ApiOperation({ summary: "Récupérer toutes les demandes (ADMIN uniquement)" })
  findAll() {
    // Appel d'une méthode findAll() à implémenter dans le service si nécessaire
    return (this.applicationsService as any).findAll
      ? (this.applicationsService as any).findAll()
      : [];
  }

  @Get("user/:id")
  @UseGuards(ProfileAccessGuard)
  @ApiOperation({ summary: "Récupérer les demandes d'adoption d'un candidat" })
  @ApiParam({ name: "id", description: "ID de l'utilisateur", type: Number })
  findAllSent(@Param("id", ParseIntPipe) id: number) {
    return this.applicationsService.findAllSent(id);
  }

  @Get("shelter/:id")
  @UseGuards(ProfileAccessGuard)
  @ApiOperation({ summary: "Récupérer les demandes reçues par un refuge" })
  @ApiParam({ name: "id", description: "ID du refuge", type: Number })
  findAllReceived(@Param("id", ParseIntPipe) id: number) {
    return this.applicationsService.findAllReceived(id);
  }

  @Patch(":animalId/:candidateId/status")
  @UseGuards(RolesGuard)
  @Roles(UserRole.shelter, UserRole.admin)
  @ApiOperation({ summary: "Mettre à jour le statut d'une demande" })
  @UsePipes(new ZodPipe(sharedTypes.UpdateApplicationStatusSchema))
  update(
    @Request() req: any,
    @Param("animalId", ParseIntPipe) animalId: number,
    @Param("candidateId", ParseIntPipe) candidateId: number,
    @Body() updateDto: sharedTypes.UpdateApplicationStatusDto
  ) {
    return this.applicationsService.updateStatus(
      candidateId,
      animalId,
      updateDto,
      req.user
    );
  }

  @Delete(":animalId/:candidateId")
  @UseGuards(RolesGuard)
  @Roles(UserRole.shelter, UserRole.admin)
  @ApiOperation({ summary: "Archiver / Supprimer une demande" })
  remove(
    @Request() req: any,
    @Param("animalId", ParseIntPipe) animalId: number,
    @Param("candidateId", ParseIntPipe) candidateId: number
  ) {
    return this.applicationsService.remove(candidateId, animalId, req.user);
  }

  @Post(":candidateId/:animalId/accept")
  @UseGuards(RolesGuard)
  @Roles(UserRole.shelter, UserRole.admin)
  @ApiOperation({ summary: "Accepter formellement une demande" })
  async accept(
    @Request() req: any,
    @Param("candidateId", ParseIntPipe) candidateId: number,
    @Param("animalId", ParseIntPipe) animalId: number
  ) {
    return this.applicationsService.acceptApplication(candidateId, animalId, req.user);
  }

  @Post(":candidateId/:animalId/reject")
  @UseGuards(RolesGuard)
  @Roles(UserRole.shelter, UserRole.admin)
  @ApiOperation({ summary: "Refuser formellement une demande" })
  async reject(
    @Request() req: any,
    @Param("candidateId", ParseIntPipe) candidateId: number,
    @Param("animalId", ParseIntPipe) animalId: number
  ) {
    return this.applicationsService.rejectApplication(candidateId, animalId, req.user);
  }
}