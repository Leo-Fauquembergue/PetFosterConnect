import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { UserRole } from "@prisma/client";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";
import { COOKIE_NAME } from "../src/constants";
import * as argon2 from "argon2";

describe("Auth & CSRF (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let userToken: string;
  let userId: number;
  const csrfToken = "valid-csrf-token";

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

    await prisma.pfcUser.deleteMany();

    const hashedPassword = await argon2.hash("password");
    const user = await prisma.pfcUser.create({
      data: { email: "auth@test.com", password: hashedPassword, role: UserRole.individual },
    });
    userId = user.id;
    userToken = jwtService.sign({ sub: user.id, email: user.email, role: user.role, csrfToken });
  });

  afterAll(async () => {
    await app.close();
  });

  describe("CSRF Protection", () => {
    it("doit bloquer une requête POST sans header x-csrf-token si authentifiée par cookie (403)", async () => {
      await request(app.getHttpServer())
        .post("/bookmarks/toggle")
        .set("Cookie", [`${COOKIE_NAME}=${userToken}`])
        .send({ animalId: 1 })
        .expect(403);
    });

    it("doit autoriser une requête POST avec header x-csrf-token valide si authentifiée par cookie (201/404)", async () => {
      // On s'attend à 404 car l'animal n'existe pas, mais pas 403 (CSRF pass)
      await request(app.getHttpServer())
        .post("/bookmarks/toggle")
        .set("Cookie", [`${COOKIE_NAME}=${userToken}`])
        .set("x-csrf-token", csrfToken)
        .send({ animalId: 9999 })
        .expect(404);
    });

    it("doit autoriser le bypass CSRF si un Bearer token est utilisé (priorité sécurité) (404)", async () => {
      // Pas de header CSRF ici, mais un Bearer token
      await request(app.getHttpServer())
        .post("/bookmarks/toggle")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ animalId: 9999 })
        .expect(404);
    });
  });

  describe("Login/Logout flow", () => {
    it("doit poser les cookies HttpOnly lors du login et valider l'authentification (201)", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .set("x-csrf-token", csrfToken)
        .send({
          email: "auth@test.com",
          password: "password"
        })
        .expect(201);

      const cookies = response.get("Set-Cookie") || [];
      expect(cookies.some(c => c.includes(COOKIE_NAME))).toBe(true);
      expect(cookies.some(c => c.includes("refresh_token"))).toBe(true);
      expect(response.body.csrfToken).toBeDefined();
    });

    it("doit rejeter un login avec de mauvais identifiants (401)", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .set("x-csrf-token", csrfToken)
        .send({
          email: "auth@test.com",
          password: "wrongpassword"
        })
        .expect(401);
    });

    it("doit effacer les cookies lors du logout (201)", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/logout")
        .set("x-csrf-token", csrfToken)
        .expect(201);

      const cookies = response.get("Set-Cookie") || [];
      expect(cookies.some(c => c.includes(`${COOKIE_NAME}=;`))).toBe(true);
      expect(cookies.some(c => c.includes("refresh_token=;"))).toBe(true);
    });
  });

  describe("Refresh Token Flow", () => {
    it("doit refuser le rafraîchissement sans refresh_token", async () => {
      await request(app.getHttpServer())
        .post("/auth/refresh")
        .expect(401);
    });

    it("doit rafraîchir le jeton et retourner un nouveau csrfToken (201)", async () => {
      const loginResponse = await request(app.getHttpServer())
        .post("/auth/login")
        .set("x-csrf-token", csrfToken)
        .send({
          email: "auth@test.com",
          password: "password"
        })
        .expect(201);
      
      const cookies = loginResponse.get("Set-Cookie") || [];
      
      const refreshResponse = await request(app.getHttpServer())
        .post("/auth/refresh")
        .set("Cookie", cookies)
        .expect(201);
      
      const newCookies = refreshResponse.get("Set-Cookie") || [];
      expect(newCookies.some(c => c.includes(COOKIE_NAME))).toBe(true);
      expect(refreshResponse.body.csrfToken).toBeDefined();
      expect(refreshResponse.body.csrfToken).not.toBe(loginResponse.body.csrfToken);
    });
  });
});
