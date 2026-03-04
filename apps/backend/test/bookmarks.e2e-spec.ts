import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';

describe('Bookmarks (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let userToken: string;
  let userId: number;
  let animalId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    await prisma.bookmark.deleteMany();
    await prisma.animal.deleteMany();
    await prisma.species.deleteMany();
    await prisma.pfcUser.deleteMany();

    const user = await prisma.pfcUser.create({ 
      data: { email: 'test@fav.com', password: '123', role: UserRole.individual } 
    });
    userId = user.id;
    userToken = jwtService.sign({ sub: user.id, email: user.email, role: user.role });

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

  afterAll(async () => {
    await app.close();
  });

  it('POST /bookmarks/toggle -> doit bloquer l\'accès sans token (401)', async () => {
    await request(app.getHttpServer())
      .post('/bookmarks/toggle')
      .send({ animalId: animalId })
      .expect(401);
  });

  it('POST /bookmarks/toggle -> doit renvoyer une erreur Zod (400) si données invalides', async () => {
    await request(app.getHttpServer())
      .post('/bookmarks/toggle')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ animalId: "invalid_id" }) // Zod attend un nombre
      .expect(400);
  });

  it('POST /bookmarks/toggle -> devrait ajouter puis retirer (Toggle)', async () => {
    // 1. AJOUT
    const res1 = await request(app.getHttpServer())
      .post('/bookmarks/toggle')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ animalId: animalId })
      .expect(201);

    expect(res1.body.bookmarked).toBe(true);

    // 2. SUPPRESSION
    const res2 = await request(app.getHttpServer())
      .post('/bookmarks/toggle')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ animalId: animalId })
      .expect(201);

    expect(res2.body.bookmarked).toBe(false);
  });

  it('GET /bookmarks/me -> devrait lister mes favoris', async () => {
    await prisma.bookmark.create({ data: { pfcUserId: userId, animalId: animalId } });

    const res = await request(app.getHttpServer())
      .get('/bookmarks/me')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].animal.name).toBe('Rex');
  });
});