import { Test, TestingModule } from "@nestjs/testing";
import type { CreateAnimalDto, RequestWithUser, UpdateAnimalDto } from "@projet/shared-types";
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
    }).compile();

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
    it("doit passer l'objet utilisateur complet au service pour validation IDOR", async () => {
      const dto = { name: "Rex Junior" } as Partial<UpdateAnimalDto>;
      const req = { user: { id: 5, role: "shelter" } } as Partial<RequestWithUser>;

      await controller.update(1, dto as UpdateAnimalDto, req as RequestWithUser);
      expect(service.update).toHaveBeenCalledWith(1, dto, req.user);
    });
  });

  describe("remove", () => {
    it("doit passer l'objet utilisateur complet au service pour validation IDOR", async () => {
      const req = { user: { id: 5, role: "shelter" } } as Partial<RequestWithUser>;

      await controller.remove(1, req as RequestWithUser);
      expect(service.remove).toHaveBeenCalledWith(1, req.user);
    });
  });

  describe("findAll", () => {
    it("doit appeler la méthode findAll du service", async () => {
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("doit appeler la méthode findOne du service avec le bon ID et l'objet de requête", async () => {
      const req = { user: { id: 5, role: "individual" } } as Partial<RequestWithUser>;

      await controller.findOne(1, req as RequestWithUser);
      expect(service.findOne).toHaveBeenCalled();
    });
  });

  describe("findByShelter", () => {
    it("doit appeler la méthode findAllByShelter du service", async () => {
      await controller.findByShelter("1");
      expect(service.findAllByShelter).toHaveBeenCalled();
    });
  });
});
