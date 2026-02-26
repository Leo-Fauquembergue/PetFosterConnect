import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AnimalsModule } from "./animals/animals.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { HealthController } from "./health/health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { SheltersModule } from "./shelters/shelters.module";
import { ApplicationsModule } from "./applications/applications.module";
import { SpeciesModule } from './species/species.module';
import { BookmarksModule } from "./bookmarks/bookmarks.module";
import { EmailsModule } from "./emails/emails.module";
/**
 * MODULE RACINE (ROOT MODULE)
 * * Ce module est le chef d'orchestre de l'application NestJS.
 * * - ConfigModule : Initialise la gestion des variables d'environnement (.env).
 * - PrismaModule : Expose la connexion à la base de données (injectable partout).
 * - AppController/Service : Gèrent les requêtes de base pour vérifier le statut de l'API.
 * * @module AppModule
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Recommandé : rend le .env accessible dans tous les futurs modules
    }),
    PrismaModule,
    UsersModule,
    AnimalsModule,
    AuthModule,
    SheltersModule,
    ApplicationsModule,
    SpeciesModule,
    BookmarksModule,
    EmailsModule
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
