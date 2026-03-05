import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { UserRole } from "@prisma/client";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Animals (E2E) - Security & RBAC", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let shelterToken: string;
  let attackerToken: string;
  let individualToken: string;
  let sharedSpeciesId: number;
  let createdAnimalId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    await prisma.animal.deleteMany();
    await prisma.species.deleteMany();
    await prisma.pfcUser.deleteMany();

    const shelter = await prisma.pfcUser.create({
      data: { email: "refuge_legitime@test.com", password: "hash", role: UserRole.shelter },
    });
    shelterToken = jwtService.sign({ sub: shelter.id, email: shelter.email, role: shelter.role });

    const attacker = await prisma.pfcUser.create({
      data: { email: "refuge_attaquant@test.com", password: "hash", role: UserRole.shelter },
    });
    attackerToken = jwtService.sign({
      sub: attacker.id,
      email: attacker.email,
      role: attacker.role,
    });

    const individual = await prisma.pfcUser.create({
      data: { email: "adoptant@test.com", password: "hash", role: UserRole.individual },
    });
    individualToken = jwtService.sign({
      sub: individual.id,
      email: individual.email,
      role: individual.role,
    });

    const species = await prisma.species.create({ data: { name: "Chien" } });
    sharedSpeciesId = species.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /animals (Création & RBAC)", () => {
    const createDto = {
      name: "Pongo",
      age: "2 ans",
      sex: "male",
      animalStatus: "available",
      description: "Un chien amical",
      weight: 25,
    };

    it("doit bloquer la création si l'utilisateur est un particulier (RBAC - 403)", async () => {
      await request(app.getHttpServer())
        .post("/animals")
        .set("Authorization", `Bearer ${individualToken}`)
        .send({ ...createDto, speciesId: sharedSpeciesId })
        .expect(403);
    });

    it("doit autoriser la création si l'utilisateur est un refuge (201)", async () => {
      const response = await request(app.getHttpServer())
        .post("/animals")
        .set("Authorization", `Bearer ${shelterToken}`)
        .send({ ...createDto, speciesId: sharedSpeciesId })
        .expect(201);

      createdAnimalId = response.body.id;
      expect(response.body.name).toBe("Pongo");
    });
  });

  describe("GET /animals", () => {
    it("devrait retourner une liste contenant l'animal créé (Public - 200)", async () => {
      const response = await request(app.getHttpServer()).get("/animals").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe("PATCH /animals/:id (Modification & Faille IDOR)", () => {
    it("doit bloquer la modification par un AUTRE refuge (IDOR bloquée - 403)", async () => {
      await request(app.getHttpServer())
        .patch(`/animals/${createdAnimalId}`)
        .set("Authorization", `Bearer ${attackerToken}`)
        .send({ name: "Hacked Name" })
        .expect(403);
    });

    it("doit autoriser la modification par le refuge PROPRIÉTAIRE (200)", async () => {
      await request(app.getHttpServer())
        .patch(`/animals/${createdAnimalId}`)
        .set("Authorization", `Bearer ${shelterToken}`)
        .send({ name: "Pongo Modifié" })
        .expect(200);
    });
  });

  describe("DELETE /animals/:id (Suppression & Faille IDOR)", () => {
    it("doit bloquer la suppression par un non-propriétaire (IDOR bloquée - 403)", async () => {
      await request(app.getHttpServer())
        .delete(`/animals/${createdAnimalId}`)
        .set("Authorization", `Bearer ${attackerToken}`)
        .expect(403);
    });

    it("doit effectuer la suppression par le propriétaire (Soft Delete - 200)", async () => {
      await request(app.getHttpServer())
        .delete(`/animals/${createdAnimalId}`)
        .set("Authorization", `Bearer ${shelterToken}`)
        .expect(200);

      const deletedAnimal = await prisma.animal.findUnique({
        where: { id: createdAnimalId },
      });

      expect(deletedAnimal).not.toBeNull();
      expect(deletedAnimal?.deletedAt).not.toBeNull();
    });
  });
});
