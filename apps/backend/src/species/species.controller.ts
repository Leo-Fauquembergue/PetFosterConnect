import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { z } from "zod";
import { Roles } from "../auth/decorators/roles.decorators";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { ZodPipe } from "../common/pipes/zod.pipe";
import { IdSchema } from "../common/schemas/params.schema";
import { SpeciesService } from "./species.service";

const NameSchema = z.object({ name: z.string().min(1) });

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
  @UsePipes(new ZodPipe(NameSchema))
  async create(@Body() createDto: { name: string }) {
    return this.speciesService.create(createDto);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Modifier une espèce (Admin uniquement)" })
  @UsePipes(new ZodPipe(NameSchema))
  async update(
    @Param("id", new ZodPipe(IdSchema)) id: number,
    @Body() updateDto: { name: string }
  ) {
    return this.speciesService.update(id, updateDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Supprimer une espèce (Admin uniquement)" })
  async remove(@Param("id", new ZodPipe(IdSchema)) id: number) {
    return this.speciesService.remove(id);
  }
}
