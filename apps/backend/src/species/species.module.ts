import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SpeciesController } from "./species.controller";
import { SpeciesService } from "./species.service";

@Module({
  controllers: [SpeciesController],
  providers: [SpeciesService, PrismaService],
})
export class SpeciesModule {}
