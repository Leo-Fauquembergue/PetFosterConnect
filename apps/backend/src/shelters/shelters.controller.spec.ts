import { Test, TestingModule } from "@nestjs/testing";
import { AnimalsService } from "../animals/animals.service";
import { PrismaService } from "../prisma/prisma.service";
import { SheltersController } from "./shelters.controller";
import { SheltersService } from "./shelters.service";

describe("ShelterController (integration)", () => {
  let controller: SheltersController;
  let prisma: PrismaService;
  let testUserId: number; // accessible dans tous les tests

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SheltersController],
      providers: [SheltersService, AnimalsService, PrismaService],
    }).compile();

    controller = module.get<SheltersController>(SheltersController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prisma.shelterProfile.deleteMany();
    await prisma.pfcUser.deleteMany();

    const user = await prisma.pfcUser.create({
      data: {
        email: "refuge@test.com",
        password: "hashedpassword",
        role: "shelter", // attention à respecter ton enum UserRole
      },
    });

    await prisma.shelterProfile.create({
      data: {
        pfcUserId: user.id,
        siret: "12345678901234",
        shelterName: "Refuge Test",
        description: "Un refuge fictif pour test",
        logo: null,
      },
    });

    testUserId = user.id; // stocke l’ID pour les tests
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("1. devrait retourner tous les refuges", async () => {
    const result = await controller.findAll();
    expect(result.length).toBe(1);
    expect(result[0].shelterName).toBe("Refuge Test");
  });

  it("2. devrait retourner un refuge par id", async () => {
    const result = await controller.findOne(String(testUserId));
    expect(result?.shelterName).toBe("Refuge Test");
  });

  it("3. devrait créer un refuge", async () => {
    const newUser = await prisma.pfcUser.create({
      data: {
        email: "nouveau@test.com",
        password: "hashedpassword",
        role: "shelter",
      },
    });

    const dto = {
      pfcUserId: newUser.id,
      siret: "98765432109876",
      shelterName: "Refuge Nouveau",
      description: "Un nouveau refuge pour test",
      logo: null,
    };

    const result = await controller.create(dto);
    expect(result.shelterName).toBe("Refuge Nouveau");
  });

  it("4. devrait mettre à jour un refuge", async () => {
    const updates = { shelterName: "Refuge Modifié" };
    const result = await controller.update(String(testUserId), updates);
    expect(result.shelterName).toBe("Refuge Modifié");
  });

  it("5. devrait supprimer un refuge", async () => {
    await controller.remove(String(testUserId));
    const shelter = await prisma.shelterProfile.findUnique({ where: { pfcUserId: testUserId } });
    expect(shelter).toBeNull();
  });
});
