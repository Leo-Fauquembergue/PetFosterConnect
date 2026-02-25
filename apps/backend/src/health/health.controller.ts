import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "../prisma/prisma.service";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({
    summary: "Vérifier l'état de santé de l'API et de la base de données",
  })
  @ApiResponse({
    status: 200,
    description: "État de santé retourné avec succès",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        timestamp: { type: "string", example: "2026-01-29T10:30:00.000Z" },
        services: {
          type: "object",
          properties: {
            api: { type: "string", example: "up" },
            database: { type: "string", example: "connected (PostgreSQL)" },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Erreur de connexion à la base de données",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "error" },
        timestamp: { type: "string", example: "2026-01-29T10:30:00.000Z" },
        services: {
          type: "object",
          properties: {
            api: { type: "string", example: "up" },
            database: { type: "string", example: "disconnected" },
          },
        },
        error: { type: "string", example: "Connection timeout" },
      },
    },
  })
  async check() {
    try {
      // On tente une micro-requête sur la base de données
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
        services: {
          api: "up",
          database: "connected (PostgreSQL)",
        },
      };
    } catch (error) {
      return {
        status: "error",
        timestamp: new Date().toISOString(),
        services: {
          api: "up",
          database: "disconnected",
        },
        error: error.message,
      };
    }
  }
}
