import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { UserRole } from "@prisma/client";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Applications (E2E) - Security & IDOR", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let legitShelterToken: string;
  let attackerShelterToken: string;
  let individualToken: string;

  let legitShelterId: number;
  let individualId: number;
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

    await prisma.application.deleteMany();
    await prisma.animal.deleteMany();
    await prisma.species.deleteMany();
    await prisma.pfcUser.deleteMany();

    const legitShelter = await prisma.pfcUser.create({
      data: { email: "legit@refuge.com", password: "hash", role: UserRole.shelter },
    });
    legitShelterId = legitShelter.id;
    legitShelterToken = jwtService.sign({
      sub: legitShelter.id,
      email: legitShelter.email,
      role: legitShelter.role,
    });

    const attackerShelter = await prisma.pfcUser.create({
      data: { email: "hacker@refuge.com", password: "hash", role: UserRole.shelter },
    });
    attackerShelterToken = jwtService.sign({
      sub: attackerShelter.id,
      email: attackerShelter.email,
      role: attackerShelter.role,
    });

    const individual = await prisma.pfcUser.create({
      data: { email: "adoptant@test.com", password: "hash", role: UserRole.individual },
    });
    individualId = individual.id;
    individualToken = jwtService.sign({
      sub: individual.id,
      email: individual.email,
      role: individual.role,
    });

    const species = await prisma.species.create({ data: { name: "Chat" } });

    const animal = await prisma.animal.create({
      data: {
        name: "Mimi",
        age: "1 an",
        sex: "female",
        animalStatus: "available",
        description: "Un chat amical",
        weight: 4,
        pfcUserId: legitShelterId,
        speciesId: species.id,
      },
    });
    animalId = animal.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /applications", () => {
    it("doit bloquer l'accès sans token (401)", async () => {
      await request(app.getHttpServer())
        .post("/applications")
        .send({
          animalId: animalId,
          message: "Je souhaite adopter Mimi",
          applicationType: "adoption",
        })
        .expect(401);
    });

    it("doit renvoyer une erreur Zod (400) si les données sont invalides", async () => {
      await request(app.getHttpServer())
        .post("/applications")
        .set("Authorization", `Bearer ${individualToken}`)
        .send({
          animalId: "id_invalide", // Doit être un nombre
          applicationType: "vol", // Invalide (adoption ou foster)
        })
        .expect(400);
    });

    it("doit permettre à un particulier de soumettre une candidature (201)", async () => {
      const response = await request(app.getHttpServer())
        .post("/applications")
        .set("Authorization", `Bearer ${individualToken}`)
        .send({
          animalId: animalId,
          message: "Je souhaite adopter Mimi",
          applicationType: "adoption",
        })
        .expect(201);

      expect(response.body.applicationStatus).toBe("pending");
    });
  });

  describe("PATCH /applications/:animalId/:candidateId/status (Faille IDOR)", () => {
    it("doit bloquer un refuge qui tente d'accepter/refuser la demande d'un AUTRE refuge (403)", async () => {
      await request(app.getHttpServer())
        .patch(`/applications/${animalId}/${individualId}/status`)
        .set("Authorization", `Bearer ${attackerShelterToken}`)
        .send({ applicationStatus: "approved" })
        .expect(403);
    });

    it("doit autoriser le refuge propriétaire de l'animal à modifier le statut (200)", async () => {
      await request(app.getHttpServer())
        .patch(`/applications/${animalId}/${individualId}/status`)
        .set("Authorization", `Bearer ${legitShelterToken}`)
        .send({ applicationStatus: "approved" })
        .expect(200);
    });
  });
});
