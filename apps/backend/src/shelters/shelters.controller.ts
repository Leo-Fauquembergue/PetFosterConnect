import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import * as sharedTypes from "@projet/shared-types";
import { AnimalsService } from "../animals/animals.service";
import { Roles } from "../auth/decorators/roles.decorators";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ProfileAccessGuard } from "../auth/guards/profile-access.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ZodPipe } from "../common/pipes/zod.pipe";
import { IdSchema, LimitSchema } from "../common/schemas/params.schema";
import { UsersService } from "../users/users.service";
import { SheltersService } from "./shelters.service";

@ApiTags("shelters")
@Controller("shelters")
export class SheltersController {
  constructor(
    private readonly sheltersService: SheltersService,
    private readonly animalsService: AnimalsService,
    private readonly usersService: UsersService
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Créer un profil de refuge" })
  @ApiResponse({ status: 201, description: "Refuge créé avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  create(
    @Body(new ZodPipe(sharedTypes.CreateShelterProfileSchema))
    body: sharedTypes.CreateShelterProfileDto
  ) {
    return this.sheltersService.create(body);
  }

  @Get()
  @ApiOperation({ summary: "Récupérer tous les refuges" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Nombre maximum de refuges à retourner",
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: "Liste des refuges retournée avec succès",
  })
  findAll(@Query("limit", new ZodPipe(LimitSchema)) limit: number) {
    return this.sheltersService.findAll(limit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Récupérer un refuge par son ID" })
  @ApiParam({ name: "id", description: "ID du refuge", type: Number })
  @ApiResponse({ status: 200, description: "Refuge trouvé" })
  @ApiResponse({ status: 404, description: "Refuge non trouvé" })
  findOne(@Param("id", new ZodPipe(IdSchema)) id: number) {
    return this.sheltersService.findOne(id);
  }

  @Get(":id/animals")
  @ApiOperation({ summary: "Récupérer tous les animaux d'un refuge" })
  @ApiParam({ name: "id", description: "ID du refuge", type: Number })
  @ApiResponse({
    status: 200,
    description: "Liste des animaux du refuge retournée avec succès",
  })
  @ApiResponse({ status: 404, description: "Refuge non trouvé" })
  findAnimals(@Param("id", new ZodPipe(IdSchema)) id: number) {
    return this.animalsService.findAllByShelter(id);
  }

  @UseGuards(JwtAuthGuard, ProfileAccessGuard)
  @Put(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mettre à jour un refuge" })
  @ApiParam({ name: "id", description: "ID du refuge", type: Number })
  @ApiResponse({ status: 200, description: "Refuge mis à jour avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 403, description: "Accès refusé" })
  @ApiResponse({ status: 404, description: "Refuge non trouvé" })
  update(
    @Param("id", new ZodPipe(IdSchema)) id: number,
    @Body(new ZodPipe(sharedTypes.UpdateShelterProfileSchema))
    body: sharedTypes.UpdateShelterProfileDto
  ) {
    return this.sheltersService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Delete(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Supprimer un refuge" })
  @ApiParam({ name: "id", description: "ID du refuge", type: Number })
  @ApiResponse({ status: 200, description: "Refuge supprimé avec succès" })
  @ApiResponse({ status: 403, description: "Accès refusé" })
  @ApiResponse({ status: 404, description: "Refuge non trouvé" })
  remove(@Param("id", new ZodPipe(IdSchema)) id: number) {
    // 🛡️ SÉCURITÉ : On délègue à UsersService pour assurer la cascade du soft-delete
    return this.usersService.remove(id);
  }
}
