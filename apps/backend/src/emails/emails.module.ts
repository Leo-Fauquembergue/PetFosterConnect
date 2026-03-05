import { Module } from "@nestjs/common";
import { EmailsController } from "./emails.controller";
import { EmailsService } from "./emails.service";

@Module({
  providers: [EmailsService],
  controllers: [EmailsController],
  exports: [EmailsService], // 👈 indispensable pour l’utiliser ailleurs
})
export class EmailsModule {}
