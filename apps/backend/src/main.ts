import { UnauthorizedException } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./common/filters/http-exception.filter"; // 🛡️ SÉCURITÉ

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Sécurisation des en-têtes HTTP
  app.use(helmet());

  // Gérer les cookies
  app.use(cookieParser());

  // CONFIGURATION CORS SÉCURISÉE
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:5173", // Dev local
        "http://localhost:3000",
        process.env.FRONTEND_URL, // Prod stricte Vercel (à définir dans ton .env de production sur Render)
      ].filter(Boolean);

      // 🛡️ SÉCURITÉ : Autorise l'absence d'origine (accès direct/Swagger) ou les domaines listés
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new UnauthorizedException("Not allowed by CORS"));
    },
    credentials: true, // Requis pour tes cookies/sessions Vercel <-> Render
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "x-csrf-token"],
  });

  // DOCUMENTATION SWAGGER
  const config = new DocumentBuilder()
    .setTitle("API Adoption Animaux")
    .setDescription("Documentation complète de l'API pour la plateforme d'adoption d'animaux")
    .setVersion("1.0")
    .addTag("animals", "Gestion des animaux")
    .addTag("applications", "Gestion des demandes d'adoption")
    .addTag("auth", "Authentification et autorisation")
    .addTag("bookmarks", "Gestion des favoris")
    .addTag("emails", "Envoi d'emails")
    .addTag("shelters", "Gestion des refuges")
    .addTag("species", "Liste des espèces")
    .addTag("users", "Gestion des utilisateurs")
    .addTag("health", "État de santé de l'API")
    .addTag("app", "Routes générales")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  // 🛡️ SÉCURITÉ : Application du filtre global d'exceptions
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
