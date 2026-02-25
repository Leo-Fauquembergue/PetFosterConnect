import { Module } from "@nestjs/common";
import { SheltersService } from "./shelters.service";
import { SheltersController } from "./shelters.controller";
import { PrismaService } from "../prisma/prisma.service";
import { AnimalsModule } from '../animals/animals.module';

@Module({
  imports: [AnimalsModule],
  controllers: [SheltersController],
  providers: [SheltersService, PrismaService],
})
export class SheltersModule {}
