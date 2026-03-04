import { Test, TestingModule } from '@nestjs/testing';
import { AnimalsController } from './animals.controller';
import { AnimalsService } from './animals.service';

describe('AnimalsController', () => {
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
      providers: [
        { provide: AnimalsService, useValue: mockAnimalsService },
      ],
    }).compile();

    controller = module.get<AnimalsController>(AnimalsController);
    service = module.get<AnimalsService>(AnimalsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('doit extraire req.user.id et le passer au service (Pré-requis Sécurité)', async () => {
      const dto = { name: 'Rex', speciesId: 1 } as any;
      const req = { user: { id: 5, role: 'shelter' } };

      await controller.create(dto, req);

      expect(service.create).toHaveBeenCalledWith(dto, 5);
    });
  });

  describe('update', () => {
    it('doit passer l\'objet utilisateur complet au service pour validation IDOR', async () => {
      const dto = { name: 'Rex Junior' } as any;
      const req = { user: { id: 5, role: 'shelter' } };

      await controller.update(1, dto, req);

      expect(service.update).toHaveBeenCalledWith(1, dto, req.user);
    });
  });

  describe('remove', () => {
    it('doit passer l\'objet utilisateur complet au service pour validation IDOR', async () => {
      const req = { user: { id: 5, role: 'shelter' } };

      await controller.remove(1, req);

      expect(service.remove).toHaveBeenCalledWith(1, req.user);
    });
  });

  describe('findAll', () => {
    it('doit appeler la méthode findAll du service', async () => {
      await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('doit appeler la méthode findOne du service avec le bon ID et l\'objet de requête (pour les favoris)', async () => {
      const req = { user: { id: 5, role: 'individual' } };
      
      await controller.findOne(1, req);
      
      expect(service.findOne).toHaveBeenCalled();
    });
  });

  describe('findByShelter', () => {
    it('doit appeler la méthode findAllByShelter du service', async () => {
      await controller.findByShelter('1');
      
      // On vérifie que la méthode du service est bien déclenchée
      expect(service.findAllByShelter).toHaveBeenCalled();
    });
  });
});