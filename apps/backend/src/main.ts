import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser'; // 👈 C'est ici la correction !
import helmet from 'helmet';
import { AppModule } from './app.module';

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
        'http://localhost:5173', // Dev local
        'http://localhost:3000',
        process.env.FRONTEND_URL, // Prod stricte (à définir dans ton .env de production)
      ].filter(Boolean);

      // Autoriser les requêtes sans origine (ex: Postman) ou si elles sont dans la liste blanche
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Sinon refuser
      console.warn(`🚫 CORS Bloqué: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // Requis pour tes cookies/sessions
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // DOCUMENTATION SWAGGER
  const config = new DocumentBuilder()
    .setTitle('API Adoption Animaux')
    .setDescription(
      "Documentation complète de l'API pour la plateforme d'adoption d'animaux",
    )
    .setVersion('1.0')
    .addTag('animals', 'Gestion des animaux')
    .addTag('applications', "Gestion des demandes d'adoption")
    .addTag('auth', 'Authentification et autorisation')
    .addTag('bookmarks', 'Gestion des favoris')
    .addTag('emails', "Envoi d'emails")
    .addTag('shelters', 'Gestion des refuges')
    .addTag('species', 'Liste des espèces')
    .addTag('users', 'Gestion des utilisateurs')
    .addTag('health', "État de santé de l'API")
    .addTag('app', 'Routes générales')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // VALIDATION DES DONNÉES
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Nettoie les champs non prévus
      forbidNonWhitelisted: true, // Rejette si des champs inconnus sont envoyés
      transform: true, // Convertit les types automatiquement (ex: id string -> number)
    }),
  );

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();