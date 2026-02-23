import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtAuthGuard } from '../src/auth/auth.guard'; // Vérifie bien le chemin ici

describe('Bookmarks (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId: number;
  let animalId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: (ctx) => {
        const req = ctx.switchToHttp().getRequest();
        req.user = { id: userId }; 
        return true;
    }})
    .compile();

    app = moduleFixture.createNestApplication();
    // Note: Pas besoin de ValidationPipe global si tu utilises ZodPipe localement dans le controller
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    await prisma.bookmark.deleteMany();
    await prisma.animal.deleteMany();
    await prisma.species.deleteMany();
    await prisma.pfcUser.deleteMany();

    const user = await prisma.pfcUser.create({ 
      data: { email: 'test@fav.com', password: '123', role: 'individual' } 
    });
    userId = user.id;

    const species = await prisma.species.create({ data: { name: 'Chat' } });
    const animal = await prisma.animal.create({
      data: { 
        name: 'Rex', 
        speciesId: species.id, 
        pfcUserId: user.id, 
        animalStatus: 'available', 
        sex: 'male' 
      }
    });
    animalId = animal.id;
  });

  afterAll(async () => { await app.close(); });

  it('POST /bookmarks/toggle -> devrait ajouter puis retirer (Toggle)', async () => {
    // 1. AJOUT (On envoie animalId dans le Body car ton controller utilise @Body() dto)
    const res1 = await request(app.getHttpServer())
      .post('/bookmarks/toggle')
      .send({ animalId: animalId })
      .expect(201);

    expect(res1.body.bookmarked).toBe(true);

    // 2. SUPPRESSION (Deuxième appel identique pour le toggle OFF)
    const res2 = await request(app.getHttpServer())
      .post('/bookmarks/toggle')
      .send({ animalId: animalId })
      .expect(201);

    expect(res2.body.bookmarked).toBe(false);
  });

  it('GET /bookmarks/me -> devrait lister mes favoris', async () => {
    // On recrée le favori pour être sûr d'avoir une liste
    await prisma.bookmark.create({ data: { pfcUserId: userId, animalId: animalId } });

    const res = await request(app.getHttpServer())
      .get('/bookmarks/me') // Ta route est @Get('me')
      .expect(200);
    
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].animal.name).toBe('Rex');
  });
});