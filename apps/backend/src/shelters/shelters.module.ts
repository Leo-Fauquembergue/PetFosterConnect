import { Module } from "@nestjs/common";
import { ShelterService } from "./shelters.service";
import { ShelterController } from "./shelters.controller";
import { PrismaService } from "../prisma/prisma.service";
import { AnimalsModule } from '../animals/animals.module';

@Module({
  imports: [AnimalsModule],
  controllers: [ShelterController],
  providers: [ShelterService, PrismaService],
})
export class ShelterModule {}
