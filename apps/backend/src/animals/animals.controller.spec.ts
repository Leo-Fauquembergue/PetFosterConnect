import { Test, TestingModule } from "@nestjs/testing";
import type { CreateAnimalDto, RequestWithUser, UpdateAnimalDto } from "@projet/shared-types";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ResourceOwnerGuard } from "../auth/guards/resource-owner.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { AnimalsController } from "./animals.controller";
import { AnimalsService } from "./animals.service";

describe("AnimalsController", () => {
  let controller: AnimalsController;
  let service: AnimalsService;

  const mockAnimalsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findAllByShelter: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnimalsController],
      providers: [{ provide: AnimalsService, useValue: mockAnimalsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ResourceOwnerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AnimalsController>(AnimalsController);
    service = module.get<AnimalsService>(AnimalsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("create", () => {
    it("doit extraire req.user.id et le passer au service (Pré-requis Sécurité)", async () => {
      const dto = { name: "Rex", speciesId: 1 } as Partial<CreateAnimalDto>;
      const req = { user: { id: 5, role: "shelter" } } as Partial<RequestWithUser>;

      await controller.create(dto as CreateAnimalDto, req as RequestWithUser);
      expect(service.create).toHaveBeenCalledWith(dto, 5);
    });
  });

  describe("update", () => {
    it("doit appeler la méthode update du service", async () => {
      const dto = { name: "Rex Junior" } as Partial<UpdateAnimalDto>;

      await controller.update(1, dto as UpdateAnimalDto);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe("remove", () => {
    it("doit appeler la méthode remove du service", async () => {
      await controller.remove(1);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe("findAll", () => {
    it("doit appeler la méthode findAll du service", async () => {
      await controller.findAll(10);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("doit appeler la méthode findOne du service avec le bon ID", async () => {
      const req = { user: { id: 5, role: "individual" } } as Partial<RequestWithUser>;

      await controller.findOne(1, req as RequestWithUser);
      expect(service.findOne).toHaveBeenCalledWith(1, 5);
    });
  });

  describe("findByShelter", () => {
    it("doit appeler la méthode findAllByShelter du service", async () => {
      await controller.findByShelter(1);
      expect(service.findAllByShelter).toHaveBeenCalledWith(1);
    });
  });
});
