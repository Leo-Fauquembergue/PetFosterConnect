import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
// ⚡ Import des types uniquement pour le typage (compile-time)
import type {
  UpdatePasswordDto,
  UpdateUserWithIndividualProfileDto,
  UpdateUserWithShelterProfileDto,
} from "@projet/shared-types";
import * as sharedTypes from "@projet/shared-types";
// ⚡ Import des schémas globaux (runtime)
import {
  UpdatePasswordSchema,
  UpdateUserSchema, // 🛡️ SÉCURITÉ : Import ajouté pour le PATCH
  UpdateUserWithIndividualProfileSchema,
  UpdateUserWithShelterProfileSchema,
} from "@projet/shared-types";
import { Roles } from "../auth/decorators/roles.decorators";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ProfileAccessGuard } from "../auth/guards/profile-access.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ZodPipe } from "../common/pipes/zod.pipe";
import { IdSchema } from "../common/schemas/params.schema";
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // --- 1. ROUTES SPÉCIFIQUES (Profils) D'ABORD ---

  @Get(":id/profile")
  @UseGuards(JwtAuthGuard, ProfileAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer le profil complet d'un utilisateur" })
  @ApiParam({ name: "id", description: "ID de l'utilisateur", type: Number })
  @ApiResponse({ status: 200, description: "Profil utilisateur retourné avec succès" })
  @ApiResponse({ status: 401, description: "Non authentifié" })
  @ApiResponse({
    status: 403,
    description: "Accès refusé - vous ne pouvez voir que votre propre profil",
  })
  @ApiResponse({ status: 404, description: "Utilisateur non trouvé" })
  getProfile(@Param("id", new ZodPipe(IdSchema)) id: number) {
    return this.usersService.getProfile(id);
  }

  @Put(":id/individual-profile")
  @UseGuards(JwtAuthGuard, ProfileAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mettre à jour le profil individuel d'un utilisateur" })
  @ApiParam({ name: "id", description: "ID de l'utilisateur", type: Number })
  @ApiResponse({ status: 200, description: "Profil individuel mis à jour avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 404, description: "Utilisateur non trouvé" })
  @UsePipes(new ZodPipe(UpdateUserWithIndividualProfileSchema))
  async updateIndividualProfile(
    @Param("id", new ZodPipe(IdSchema)) id: number,
    @Body() updateDto: UpdateUserWithIndividualProfileDto
  ) {
    return this.usersService.updateIndividualProfile(id, updateDto);
  }

  @Put(":id/shelter-profile")
  @UseGuards(JwtAuthGuard, ProfileAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mettre à jour le profil refuge d'un utilisateur" })
  @ApiParam({ name: "id", description: "ID de l'utilisateur", type: Number })
  @ApiResponse({ status: 200, description: "Profil refuge mis à jour avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 404, description: "Utilisateur non trouvé" })
  @UsePipes(new ZodPipe(UpdateUserWithShelterProfileSchema))
  async updateShelterProfile(
    @Param("id", new ZodPipe(IdSchema)) id: number,
    @Body() updateDto: UpdateUserWithShelterProfileDto
  ) {
    return this.usersService.updateShelterProfile(id, updateDto);
  }

  @Put(":id/password")
  @UseGuards(JwtAuthGuard, ProfileAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mettre à jour le mot de passe d'un utilisateur" })
  @ApiParam({ name: "id", description: "ID de l'utilisateur", type: Number })
  @ApiResponse({ status: 200, description: "Mot de passe mis à jour avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides ou ancien mot de passe incorrect" })
  @ApiResponse({ status: 404, description: "Utilisateur non trouvé" })
  async updatePassword(
    @Param("id", new ZodPipe(IdSchema)) id: number,
    @Body(new ZodPipe(UpdatePasswordSchema)) dto: UpdatePasswordDto
  ) {
    return this.usersService.updatePassword(id, dto);
  }

  // --- 2. ROUTES GÉNÉRIQUES CRUD (Avec paramètre dynamique) ENSUITE ---

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Créer un nouvel utilisateur (Admin)" })
  @ApiResponse({ status: 201, description: "Utilisateur créé avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides ou email déjà utilisé" })
  @UsePipes(new ZodPipe(sharedTypes.RegisterSchema))
  create(@Body() body: sharedTypes.RegisterDto) {
    return this.usersService.create(body);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer tous les utilisateurs (Admin)" })
  @ApiResponse({ status: 200, description: "Liste des utilisateurs retournée avec succès" })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, ProfileAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Récupérer un utilisateur par son ID" })
  @ApiParam({ name: "id", description: "ID de l'utilisateur", type: Number })
  @ApiResponse({ status: 200, description: "Utilisateur trouvé" })
  @ApiResponse({ status: 404, description: "Utilisateur non trouvé" })
  findOne(@Param("id", new ZodPipe(IdSchema)) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, ProfileAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Mettre à jour un utilisateur" })
  @ApiParam({ name: "id", description: "ID de l'utilisateur", type: Number })
  @ApiResponse({ status: 200, description: "Utilisateur mis à jour avec succès" })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 404, description: "Utilisateur non trouvé" })
  update(
    @Param("id", new ZodPipe(IdSchema)) id: number,
    @Body(new ZodPipe(UpdateUserSchema)) body: sharedTypes.UpdateUserDto // 🛡️ SÉCURITÉ : Application du pipe Zod
  ) {
    return this.usersService.update(id, body);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, ProfileAccessGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Supprimer un utilisateur" })
  @ApiParam({ name: "id", description: "ID de l'utilisateur", type: Number })
  @ApiResponse({ status: 200, description: "Utilisateur supprimé avec succès" })
  @ApiResponse({ status: 404, description: "Utilisateur non trouvé" })
  remove(@Param("id", new ZodPipe(IdSchema)) id: number) {
    return this.usersService.remove(id);
  }
}
