import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { Application, UserRole } from "@prisma/client";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { EmailsService } from "../src/emails/emails.service";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Applications (E2E) - Security & IDOR", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let legitShelterToken: string;
  let attackerShelterToken: string;
  let individualToken: string;
  const csrfToken = "test-csrf-token";

  let legitShelterId: number;
  let individualId: number;
  let animalId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailsService)
      .useValue({
        sendAcceptanceEmail: jest.fn().mockResolvedValue({}),
        sendRejectionEmail: jest.fn().mockResolvedValue({}),
        sendMail: jest.fn().mockResolvedValue({}),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    // 🧹 Nettoyage robuste dans le bon ordre des contraintes
    await prisma.bookmark.deleteMany();
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
      csrfToken,
    });

    const attackerShelter = await prisma.pfcUser.create({
      data: { email: "hacker@refuge.com", password: "hash", role: UserRole.shelter },
    });
    attackerShelterToken = jwtService.sign({
      sub: attackerShelter.id,
      email: attackerShelter.email,
      role: attackerShelter.role,
      csrfToken,
    });

    const individual = await prisma.pfcUser.create({
      data: { email: "adoptant@test.com", password: "hash", role: UserRole.individual },
    });
    individualId = individual.id;
    individualToken = jwtService.sign({
      sub: individual.id,
      email: individual.email,
      role: individual.role,
      csrfToken,
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
        .set("x-csrf-token", "any-token")
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
        .set("x-csrf-token", csrfToken)
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
        .set("x-csrf-token", csrfToken)
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
        .set("x-csrf-token", csrfToken)
        .send({ applicationStatus: "approved" })
        .expect(403);
    });

    it("doit autoriser le refuge propriétaire de l'animal à modifier le statut (200)", async () => {
      await request(app.getHttpServer())
        .patch(`/applications/${animalId}/${individualId}/status`)
        .set("Authorization", `Bearer ${legitShelterToken}`)
        .set("x-csrf-token", csrfToken)
        .send({ applicationStatus: "approved" })
        .expect(200);
    });
  });

  describe("DELETE /applications/:animalId/:candidateId (Suppression/Archivage - IDOR)", () => {
    it("doit bloquer un refuge qui tente de supprimer une demande d'un AUTRE refuge (403)", async () => {
      await request(app.getHttpServer())
        .delete(`/applications/${animalId}/${individualId}`)
        .set("Authorization", `Bearer ${attackerShelterToken}`)
        .set("x-csrf-token", csrfToken)
        .expect(403);
    });

    it("doit bloquer l'archivage d'une demande en attente (400)", async () => {
      // On crée une nouvelle demande pour cet animal qui n'a pas encore de statut
      const otherUser = await prisma.pfcUser.create({
        data: { email: "other@test.com", password: "hash", role: UserRole.individual },
      });

      await prisma.application.create({
        data: {
          pfcUserId: otherUser.id,
          animalId: animalId,
          applicationType: "adoption",
          message: "En attente",
          applicationStatus: "pending",
        },
      });

      await request(app.getHttpServer())
        .delete(`/applications/${animalId}/${otherUser.id}`)
        .set("Authorization", `Bearer ${legitShelterToken}`)
        .set("x-csrf-token", csrfToken)
        .expect(400); // Bad Request (Pending restriction)
    });

    it("doit autoriser le refuge propriétaire à archiver la demande (200) si elle est traitée", async () => {
      // On utilise la demande qui a été mise à 'approved' dans le test précédent
      await request(app.getHttpServer())
        .delete(`/applications/${animalId}/${individualId}`)
        .set("Authorization", `Bearer ${legitShelterToken}`)
        .set("x-csrf-token", csrfToken)
        .expect(200);

      // ⚡ VÉRIFICATION ASYMÉTRIQUE
      // 1. Le refuge ne doit plus la voir
      const shelterApps = await request(app.getHttpServer())
        .get("/applications/received")
        .set("Authorization", `Bearer ${legitShelterToken}`)
        .expect(200);
      const isStillInShelterList = shelterApps.body.some(
        (app: Application) => app.pfcUserId === individualId && app.animalId === animalId
      );
      expect(isStillInShelterList).toBe(false);

      // 2. Le particulier doit toujours la voir
      const individualApps = await request(app.getHttpServer())
        .get("/applications/sent")
        .set("Authorization", `Bearer ${individualToken}`)
        .expect(200);
      const isStillInUserList = individualApps.body.some(
        (app: Application) => app.pfcUserId === individualId && app.animalId === animalId
      );
      expect(isStillInUserList).toBe(true);
    });
  });

  describe("DELETE /applications/me/:animalId (Annuler sa propre demande)", () => {
    let newAnimalId: number;

    beforeAll(async () => {
      const species = await prisma.species.findFirst();
      const speciesId = species?.id;
      if (!speciesId) throw new Error("No species found for test");

      const animal = await prisma.animal.create({
        data: {
          name: "CancelTest",
          age: "1 an",
          sex: "female",
          animalStatus: "available",
          description: "Test cancel",
          weight: 4,
          pfcUserId: legitShelterId,
          speciesId: speciesId,
        },
      });
      newAnimalId = animal.id;

      await prisma.application.create({
        data: {
          pfcUserId: individualId,
          animalId: newAnimalId,
          applicationType: "adoption",
          message: "Test cancel message",
        },
      });
    });

    it("doit autoriser le candidat à annuler sa propre demande (200)", async () => {
      await request(app.getHttpServer())
        .delete(`/applications/me/${newAnimalId}`)
        .set("Authorization", `Bearer ${individualToken}`)
        .set("x-csrf-token", csrfToken)
        .expect(200);
    });
  });
});
