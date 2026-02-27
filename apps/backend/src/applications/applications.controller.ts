import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ParseIntPipe, UseGuards, Request } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from "@nestjs/swagger";
import * as sharedTypes from "@projet/shared-types";
import { JwtAuthGuard } from "../auth/auth.guard";
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
  create(@Request() req, @Body() createApplicationDto: sharedTypes.CreateApplicationDto) {
    return this.applicationsService.create(req.user.id, createApplicationDto);
  }

  @Get("sent")
  @ApiOperation({ summary: "Récupérer mes demandes d'adoption envoyées" })
  findAllSent(@Request() req) {
    return this.applicationsService.findAllSent(req.user.id);
  }

  @Get("received")
  @ApiOperation({ summary: "Récupérer les demandes d'adoption reçues par mon refuge" })
  findAllReceived(@Request() req) {
    return this.applicationsService.findAllReceived(req.user.id);
  }

  @Patch(":animalId/:candidateId")
  @ApiOperation({ summary: "Mettre à jour le statut d'une demande d'adoption" })
  @UsePipes(new ZodPipe(sharedTypes.UpdateApplicationStatusSchema))
  update(
    @Param("animalId", ParseIntPipe) animalId: number,
    @Param("candidateId", ParseIntPipe) candidateId: number,
    @Body() updateDto: sharedTypes.UpdateApplicationStatusDto
  ) {
    return this.applicationsService.updateStatus(candidateId, animalId, updateDto);
  }

  @Delete(":animalId/:candidateId")
  @ApiOperation({ summary: "Supprimer une demande d'adoption" })
  remove(
    @Param("animalId", ParseIntPipe) animalId: number,
    @Param("candidateId", ParseIntPipe) candidateId: number
  ) {
    return this.applicationsService.remove(candidateId, animalId);
  }

  @Post(":candidateId/:animalId/accept")
  @ApiOperation({ summary: "Accepter une demande d'adoption" })
  async accept(
    @Param("candidateId", ParseIntPipe) candidateId: number,
    @Param("animalId", ParseIntPipe) animalId: number
  ) {
    return this.applicationsService.acceptApplication(candidateId, animalId);
  }

  @Post(":candidateId/:animalId/reject")
  @ApiOperation({ summary: "Refuser une demande d'adoption" })
  async reject(
    @Param("candidateId", ParseIntPipe) candidateId: number,
    @Param("animalId", ParseIntPipe) animalId: number
  ) {
    return this.applicationsService.rejectApplication(candidateId, animalId);
  }
}