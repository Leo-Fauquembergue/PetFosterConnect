import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AnimalsModule } from "./animals/animals.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ApplicationsModule } from "./applications/applications.module";
import { AuthModule } from "./auth/auth.module";
import { BookmarksModule } from "./bookmarks/bookmarks.module";
import { CsrfMiddleware } from "./common/middlewares/csrf.middleware";
import { EmailsModule } from "./emails/emails.module";
import { HealthController } from "./health/health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { SheltersModule } from "./shelters/shelters.module";
import { SpeciesModule } from "./species/species.module";
import { UsersModule } from "./users/users.module";

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
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    UsersModule,
    AnimalsModule,
    AuthModule,
    SheltersModule,
    ApplicationsModule,
    SpeciesModule,
    BookmarksModule,
    EmailsModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CsrfMiddleware).forRoutes("*");
  }
}
