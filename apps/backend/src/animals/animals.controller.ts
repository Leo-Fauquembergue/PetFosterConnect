import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { CreateAnimalDto, UpdateAnimalDto } from "@projet/shared-types";
import { CreateAnimalSchema, UpdateAnimalSchema } from "@projet/shared-types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { OptionalJwtAuthGuard } from "../auth/guards/optional-jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorators";
import { ZodPipe } from "../common/pipes/zod.pipe";
import { AnimalsService } from "./animals.service";
import { UserRole } from "@prisma/client";

@ApiTags("animals")
@Controller("animals")
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.shelter, UserRole.admin)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: "Créer un nouvel animal" })
  @ApiResponse({ status: 201, description: "Animal créé avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 401, description: "Non authentifié" })
  @ApiResponse({ status: 403, description: "Accès refusé" })
  create(
    @Body(new ZodPipe(CreateAnimalSchema)) dto: CreateAnimalDto,
    @Req() req: any
  ) {
    return this.animalsService.create(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: "Récupérer tous les animaux" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Nombre maximum d'animaux à retourner",
    type: Number,
  })
  // 🛡️ CORRECTION SÉCURITÉ : Suppression de "includeDeleted" (Empêche l'attaque BOLA)
  @ApiResponse({
    status: 200,
    description: "Liste des animaux retournée avec succès",
  })
  findAll(
    @Query("limit") limit?: string
  ) {
    // Conversion des Query Params
    const numericLimit = limit ? parseInt(limit, 10) : undefined;

    // 🛡️ CORRECTION SÉCURITÉ : Force la valeur "false" en dur pour le public
    return this.animalsService.findAll(false, numericLimit);
  }

  // ROUTE SPECIALE ADMIN
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @Get("admin/all")
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Récupérer tous les animaux (admin - inclut les supprimés)",
  })
  @ApiResponse({
    status: 200,
    description: "Liste complète des animaux retournée avec succès",
  })
  @ApiResponse({ status: 403, description: "Accès refusé" })
  findAllAdmin() {
    return this.animalsService.findAll(true);
  }

  @Get(":id")
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer un animal par son ID" })
  @ApiParam({ name: "id", description: "ID de l'animal", type: Number })
  @ApiResponse({ status: 200, description: "Animal trouvé" })
  @ApiResponse({ status: 404, description: "Animal non trouvé" })
  async findOne(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
    const userId = req.user?.id;
    return this.animalsService.findOne(id, userId);
  }

  @Get("shelter/:id")
  @ApiOperation({ summary: "Récupérer tous les animaux d'un refuge" })
  @ApiParam({ name: "id", description: "ID du refuge", type: Number })
  @ApiResponse({
    status: 200,
    description: "Liste des animaux du refuge retournée avec succès",
  })
  async findByShelter(@Param("id") id: string) {
    return this.animalsService.findAllByShelter(Number(id));
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.shelter, UserRole.admin)
  @Patch(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mettre à jour un animal" })
  @ApiParam({ name: "id", description: "ID de l'animal", type: Number })
  @ApiResponse({ status: 200, description: "Animal mis à jour avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 403, description: "Accès refusé" })
  @ApiResponse({ status: 404, description: "Animal non trouvé" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body(new ZodPipe(UpdateAnimalSchema)) updateAnimalDto: UpdateAnimalDto,
    @Req() req: any
  ) {
    return this.animalsService.update(id, updateAnimalDto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.shelter, UserRole.admin)
  @Delete(":id")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Supprimer un animal" })
  @ApiParam({ name: "id", description: "ID de l'animal", type: Number })
  @ApiResponse({ status: 200, description: "Animal supprimé avec succès" })
  @ApiResponse({ status: 403, description: "Accès refusé" })
  @ApiResponse({ status: 404, description: "Animal non trouvé" })
  remove(@Param("id", ParseIntPipe) id: number, @Req() req: any) {
    return this.animalsService.remove(id, req.user);
  }
}