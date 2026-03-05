import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorators";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { SpeciesService } from "./species.service";

@ApiTags("species")
@Controller("species")
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Get()
  @ApiOperation({ summary: "Récupérer toutes les espèces disponibles" })
  @ApiResponse({
    status: 200,
    description: "Liste des espèces retournée avec succès",
  })
  async findAll() {
    return this.speciesService.findAll();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Créer une nouvelle espèce (Admin uniquement)" })
  async create(@Body() createDto: { name: string }) {
    return this.speciesService.create(createDto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Modifier une espèce (Admin uniquement)" })
  async update(@Param("id", ParseIntPipe) id: number, @Body() updateDto: { name: string }) {
    return this.speciesService.update(id, updateDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Supprimer une espèce (Admin uniquement)" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.speciesService.remove(id);
  }
}
