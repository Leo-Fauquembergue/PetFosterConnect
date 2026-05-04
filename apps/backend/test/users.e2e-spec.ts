import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { UserRole } from "@prisma/client";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { COOKIE_NAME } from "../src/constants";

describe("Users (E2E) - Profile Security & Anonymization", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let userAToken: string;
  let userBToken: string;
  let userAId: number;
  let userBId: number;
  const csrfToken = "test-csrf-token";

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    await prisma.bookmark.deleteMany();
    await prisma.application.deleteMany();
    await prisma.animal.deleteMany();
    await prisma.pfcUser.deleteMany();

    const userA = await prisma.pfcUser.create({
      data: { email: "userA@test.com", password: "password", role: UserRole.individual },
    });
    userAId = userA.id;
    userAToken = jwtService.sign({ sub: userA.id, email: userA.email, role: userA.role, csrfToken });

    const userB = await prisma.pfcUser.create({
      data: { email: "userB@test.com", password: "password", role: UserRole.individual },
    });
    userBId = userB.id;
    userBToken = jwtService.sign({ sub: userB.id, email: userB.email, role: userB.role, csrfToken });
  });

  afterAll(async () => {
    await app.close();
  });

  describe("GET /users/:id/profile (IDOR Check)", () => {
    it("doit autoriser l'accès à son propre profil (200)", async () => {
      await request(app.getHttpServer())
        .get(`/users/${userAId}/profile`)
        .set("Authorization", `Bearer ${userAToken}`)
        .expect(200);
    });

    it("doit bloquer l'accès au profil d'un autre utilisateur (IDOR - 403)", async () => {
      await request(app.getHttpServer())
        .get(`/users/${userBId}/profile`)
        .set("Authorization", `Bearer ${userAToken}`)
        .expect(403);
    });
  });

  describe("PUT /users/:id/individual-profile (IDOR Check)", () => {
    it("doit bloquer la modification du profil d'un autre (IDOR - 403)", async () => {
      await request(app.getHttpServer())
        .put(`/users/${userBId}/individual-profile`)
        .set("Authorization", `Bearer ${userAToken}`)
        .set("x-csrf-token", csrfToken)
        .send({
          email: "hacked@test.com",
          phoneNumber: "0611223344",
          address: "123 Rue de la Paix",
        })
        .expect(403);
    });
  });

  describe("DELETE /users/:id (Anonymization & Purge)", () => {
    it("doit anonymiser les données et interdire toute connexion ultérieure", async () => {
      // 1. Suppression
      await request(app.getHttpServer())
        .delete(`/users/${userAId}`)
        .set("Authorization", `Bearer ${userAToken}`)
        .set("x-csrf-token", csrfToken)
        .expect(200);

      // 2. Vérification DB
      const purgedUser = await prisma.pfcUser.findUnique({
        where: { id: userAId },
      });

      expect(purgedUser?.deletedAt).not.toBeNull();
      expect(purgedUser?.email).toContain("deleted_");
      expect(purgedUser?.password).toBe("ANONYMIZED_PURGED");
      expect(purgedUser?.phoneNumber).toBeNull();

      // 3. Tentative de login avec l'ancien token (doit être invalidé par la stratégie JWT qui check deletedAt)
      await request(app.getHttpServer())
        .get("/auth/me")
        .set("Authorization", `Bearer ${userAToken}`)
        .expect(401);
    });
  });
});
