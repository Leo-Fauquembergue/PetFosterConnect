import { Module } from '@nestjs/common';
import { EmailsService } from './emails.service';
import { EmailsController } from './emails.controller';

@Module({
  providers: [EmailsService],
  controllers: [EmailsController],
  exports: [EmailsService], // 👈 indispensable pour l’utiliser ailleurs
})
export class EmailsModule {}