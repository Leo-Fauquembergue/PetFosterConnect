import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UsePipes,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import * as sharedTypes from "@projet/shared-types";
import { AnimalsService } from "../animals/animals.service";
import { ZodPipe } from "../common/pipes/zod.pipe";
import { SheltersService } from "./shelters.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ProfileAccessGuard } from "../auth/guards/profile-access.guard";
import { Roles } from "../auth/decorators/roles.decorators";
import { UserRole } from "@prisma/client";

@ApiTags("shelters")
@Controller("shelters")
export class SheltersController {
  constructor(
    private readonly sheltersService: SheltersService,
    private readonly animalsService: AnimalsService
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Créer un profil de refuge" })
  @ApiResponse({ status: 201, description: "Refuge créé avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @UsePipes(new ZodPipe(sharedTypes.CreateShelterProfileSchema))
  create(@Body() body: sharedTypes.CreateShelterProfileDto) {
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
  findAll(@Query("limit") limit?: string) {
    const numericLimit = limit ? parseInt(limit, 10) : undefined;
    return this.sheltersService.findAll(numericLimit);
  }

  @Get(":id")
  @ApiOperation({ summary: "Récupérer un refuge par son ID" })
  @ApiParam({ name: "id", description: "ID du refuge", type: Number })
  @ApiResponse({ status: 200, description: "Refuge trouvé" })
  @ApiResponse({ status: 404, description: "Refuge non trouvé" })
  findOne(@Param("id") id: string) {
    return this.sheltersService.findOne(Number(id));
  }

  @Get(":id/animals")
  @ApiOperation({ summary: "Récupérer tous les animaux d'un refuge" })
  @ApiParam({ name: "id", description: "ID du refuge", type: Number })
  @ApiResponse({
    status: 200,
    description: "Liste des animaux du refuge retournée avec succès",
  })
  @ApiResponse({ status: 404, description: "Refuge non trouvé" })
  findAnimals(@Param("id") id: string) {
    return this.animalsService.findAllByShelter(Number(id));
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
  @UsePipes(new ZodPipe(sharedTypes.UpdateShelterProfileSchema))
  update(
    @Param("id") id: string,
    @Body() body: sharedTypes.UpdateShelterProfileDto
  ) {
    return this.sheltersService.update(Number(id), body);
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
  remove(@Param("id") id: string) {
    return this.sheltersService.remove(Number(id));
  }
}