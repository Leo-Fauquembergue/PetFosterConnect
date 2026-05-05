import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { UserRole } from "@prisma/client";
import cookieParser from "cookie-parser";
import request from "supertest";
import { AppModule } from "../src/app.module";
import { EmailsService } from "../src/emails/emails.service";
import { PrismaService } from "../src/prisma/prisma.service";

describe("Applications Lifecycle (E2E) - Business Rules", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

  let shelterToken: string;
  let individual1Token: string;
  let individual2Token: string;
  const csrfToken = "test-csrf-token";

  let shelterId: number;
  let ind1Id: number;
  let ind2Id: number;
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
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    jwtService = app.get<JwtService>(JwtService);

    await prisma.bookmark.deleteMany();
    await prisma.application.deleteMany();
    await prisma.animal.deleteMany();
    await prisma.species.deleteMany();
    await prisma.pfcUser.deleteMany();

    // 1. Setup Shelter
    const shelter = await prisma.pfcUser.create({
      data: { email: "shelter@lifecycle.com", password: "hash", role: UserRole.shelter },
    });
    shelterId = shelter.id;
    shelterToken = jwtService.sign({
      sub: shelterId,
      email: shelter.email,
      role: shelter.role,
      csrfToken,
    });

    // 2. Setup Individuals
    const ind1 = await prisma.pfcUser.create({
      data: { email: "ind1@test.com", password: "hash", role: UserRole.individual },
    });
    ind1Id = ind1.id;
    individual1Token = jwtService.sign({
      sub: ind1Id,
      email: ind1.email,
      role: ind1.role,
      csrfToken,
    });

    const ind2 = await prisma.pfcUser.create({
      data: { email: "ind2@test.com", password: "hash", role: UserRole.individual },
    });
    ind2Id = ind2.id;
    individual2Token = jwtService.sign({
      sub: ind2Id,
      email: ind2.email,
      role: ind2.role,
      csrfToken,
    });

    // 3. Setup Species & Animal
    const species = await prisma.species.create({ data: { name: "Dog" } });
    const animal = await prisma.animal.create({
      data: {
        name: "Max",
        age: "2 years",
        sex: "male",
        animalStatus: "available",
        description: "Good dog",
        weight: 20,
        pfcUserId: shelterId,
        speciesId: species.id,
      },
    });
    animalId = animal.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it("Step 1: Multiple individuals apply for the same animal", async () => {
    // We need to pass animalId as a number and applicationType as a valid enum
    const res1 = await request(app.getHttpServer())
      .post("/applications")
      .set("Authorization", `Bearer ${individual1Token}`)
      .set("x-csrf-token", csrfToken)
      .send({
        animalId: Number(animalId),
        message: "I am very motivated to adopt this dog and I have a big garden.",
        applicationType: "adoption",
      });

    if (res1.status !== 201) console.log("STEP 1 ERROR RES1:", res1.body);
    expect(res1.status).toBe(201);

    const res2 = await request(app.getHttpServer())
      .post("/applications")
      .set("Authorization", `Bearer ${individual2Token}`)
      .set("x-csrf-token", csrfToken)
      .send({
        animalId: Number(animalId),
        message: "I also have a big garden and I love dogs very much indeed.",
        applicationType: "adoption",
      });

    if (res2.status !== 201) console.log("STEP 1 ERROR RES2:", res2.body);
    expect(res2.status).toBe(201);
  });

  it("Step 2: Accepting one application should auto-reject others and update animal status", async () => {
    await request(app.getHttpServer())
      .patch(`/applications/${animalId}/${ind1Id}/status`)
      .set("Authorization", `Bearer ${shelterToken}`)
      .set("x-csrf-token", csrfToken)
      .send({ applicationStatus: "approved" })
      .expect(200);

    // Verify animal is now adopted
    const updatedAnimal = await prisma.animal.findUnique({ where: { id: animalId } });
    expect(updatedAnimal?.animalStatus).toBe("adopted");

    // Verify individual 1 is approved
    const app1 = await prisma.application.findUnique({
      where: { pfcUserId_animalId: { pfcUserId: ind1Id, animalId } },
    });
    expect(app1?.applicationStatus).toBe("approved");

    // Verify individual 2 is auto-rejected
    const app2 = await prisma.application.findUnique({
      where: { pfcUserId_animalId: { pfcUserId: ind2Id, animalId } },
    });
    expect(app2?.applicationStatus).toBe("rejected");
  });

  it("Step 3: Should block archiving a pending application (400)", async () => {
    const animal2 = await prisma.animal.create({
      data: {
        name: "PendingTest",
        age: "1 year",
        sex: "female",
        animalStatus: "available",
        description: "Pending test",
        weight: 5,
        pfcUserId: shelterId,
        speciesId: (await prisma.species.findFirst())?.id ?? 0,
      },
    });
    await prisma.application.create({
      data: {
        pfcUserId: ind1Id,
        animalId: animal2.id,
        applicationType: "adoption",
        message: "Wait for it...",
      },
    });

    await request(app.getHttpServer())
      .delete(`/applications/${animal2.id}/${ind1Id}`)
      .set("Authorization", `Bearer ${shelterToken}`)
      .set("x-csrf-token", csrfToken)
      .expect(400);
  });

  it("Step 4: Should allow archiving an approved or rejected application (200)", async () => {
    // ind1 application for animalId was approved in Step 2
    await request(app.getHttpServer())
      .delete(`/applications/${animalId}/${ind1Id}`)
      .set("Authorization", `Bearer ${shelterToken}`)
      .set("x-csrf-token", csrfToken)
      .expect(200);

    const archivedApp = await prisma.application.findUnique({
      where: { pfcUserId_animalId: { pfcUserId: ind1Id, animalId } },
    });
    expect(archivedApp?.deletedAt).not.toBeNull();
  });
});
