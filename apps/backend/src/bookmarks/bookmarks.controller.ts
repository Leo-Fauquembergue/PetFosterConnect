import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger"; 

import {
  type CreateBookmarkDto,
  CreateBookmarkSchema,
} from "@projet/shared-types";
import { JwtAuthGuard } from "../auth/auth.guard";
import { ZodPipe } from "../common/pipes/zod.pipe";
import { BookmarksService } from "./bookmarks.service";

@ApiTags("bookmarks")
@Controller("bookmarks")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post("toggle")
  @ApiOperation({ summary: "Ajouter ou retirer un animal des favoris" })
  @ApiResponse({
    status: 201,
    description: "Favori ajouté ou retiré avec succès",
  })
  @ApiResponse({ status: 400, description: "Données invalides" })
  @ApiResponse({ status: 401, description: "Non authentifié" })
  @ApiResponse({ status: 404, description: "Animal non trouvé" })
  
  @UsePipes(new ZodPipe(CreateBookmarkSchema))
  async toggle(
    @Req() req: any,
    @Body() dto: CreateBookmarkDto
  ) {
    return this.bookmarksService.toggle(req.user.id, dto.animalId);
  }

  @Get("me")
  @ApiOperation({ summary: "Récupérer mes animaux favoris" })
  @ApiResponse({
    status: 200,
    description: "Liste des favoris retournée avec succès",
  })
  @ApiResponse({ status: 401, description: "Non authentifié" })
  async getMyBookmarks(@Req() req: any) {
    return this.bookmarksService.findAllByUser(req.user.id);
  }
}
