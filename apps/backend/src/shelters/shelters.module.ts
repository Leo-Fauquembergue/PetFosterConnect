import { Module } from "@nestjs/common";
import { AnimalsModule } from "../animals/animals.module";
import { PrismaService } from "../prisma/prisma.service";
import { UsersModule } from "../users/users.module";
import { SheltersController } from "./shelters.controller";
import { SheltersService } from "./shelters.service";

@Module({
  imports: [AnimalsModule, UsersModule],
  controllers: [SheltersController],
  providers: [SheltersService, PrismaService],
})
export class SheltersModule {}
