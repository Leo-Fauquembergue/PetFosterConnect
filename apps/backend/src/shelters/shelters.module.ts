import { Module } from "@nestjs/common";
import { AnimalsModule } from "../animals/animals.module";
import { PrismaService } from "../prisma/prisma.service";
import { SheltersController } from "./shelters.controller";
import { SheltersService } from "./shelters.service";

@Module({
  imports: [AnimalsModule],
  controllers: [SheltersController],
  providers: [SheltersService, PrismaService],
})
export class SheltersModule {}
