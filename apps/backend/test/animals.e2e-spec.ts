import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/auth/auth.guard'; 
import { UserRole } from '@prisma/client';

describe('Animals (E2E)', () => {
  beforeAll(async () => {
    // 1. On compile d'abord le module (le Guard utilisera la référence de la variable)
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          // Important : On passe l'objet par référence, 
          // sharedShelterId sera mis à jour après la création en base
          req.user = { id: sharedShelterId }; 
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // 2. NETTOYAGE (Ordre strict pour les clés étrangères)
    await prisma.animal.deleteMany();
    await prisma.species.deleteMany();
    await prisma.pfcUser.deleteMany();

    // 3. PRÉPARATION DES DONNÉES
    const shelter = await prisma.pfcUser.create({
      data: {
        email: 'refuge@test.com',
        password: 'hash',
        role: UserRole.shelter,
      },
    });
    sharedShelterId = shelter.id; // L'ID est maintenant disponible pour le Guard

    const species = await prisma.species.create({
      data: { name: 'Chat' },
    });
    sharedSpeciesId = species.id;
  });

  // --- CREATE ---
  describe('POST /animals', () => {
    it('devrait créer un animal lié au refuge', async () => {
      const createDto = {
        name: 'Pongo',
        age: '2 ans',
        sex: 'male',
        speciesId: sharedSpeciesId,
        animalStatus: 'available',
        description: 'Un chien très amical',
        weight: 25,
        height: 60,
        acceptOtherAnimals: true,
        acceptChildren: true,
        isUrgent: false,
      };

      const response = await request(app.getHttpServer())
        .post('/animals')
        // On simule ce que le Guard ferait : on passe l'ID user dans un header ou via un mock
        // Si ton controller utilise @Req() req, il faudra peut-être mocker le guard (voir note plus bas)
        .send(createDto)
        .expect(201);

      expect(response.body.name).toBe('Pongo');
      expect(response.body.speciesId).toBe(sharedSpeciesId);
    });
  });

  // --- GET ALL ---
  describe('GET /animals', () => {
    it('devrait retourner une liste contenant au moins l animal créé', async () => {
      const response = await request(app.getHttpServer())
        .get('/animals')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  // --- GET ONE ---
  describe('GET /animals/:id', () => {
    it('devrait retourner le détail d un animal', async () => {
      // On récupère l'animal créé précédemment
      const animal = await prisma.animal.findFirst();

      const response = await request(app.getHttpServer())

        .get(`/animals/${animal!.id}`)  
        .expect(200);

      expect(response.body.id).toBe(animal!.id);
      expect(response.body.name).toBe(animal!.name);
    });

    it('devrait renvoyer 404 pour un animal inexistant', async () => {
      await request(app.getHttpServer())
        .get('/animals/999999')
        .expect(404);
    });
  });

  // --- UPDATE ---
  describe('PATCH /animals/:id', () => {
    it('devrait modifier le nom de l animal', async () => {
      const animal = await prisma.animal.findFirst();

      const response = await request(app.getHttpServer())
        .patch(`/animals/${animal!.id}`)
        .send({ name: 'Pongo Modifié' })
        .expect(200);

      expect(response.body.name).toBe('Pongo Modifié');
    });
  });

  // --- DELETE ---
  describe('DELETE /animals/:id', () => {
    it('devrait effectuer un soft delete (marquer deletedAt)', async () => {
      const animal = await prisma.animal.findFirst();

      await request(app.getHttpServer())
        .delete(`/animals/${animal!.id}`)
        .expect(200);

      // On vérifie en base que l'animal a bien un deletedAt
      const deletedAnimal = await prisma.animal.findUnique({
        where: { id: animal!.id },
      });
      expect(deletedAnimal!.deletedAt).not.toBeNull();
    });
  });
});