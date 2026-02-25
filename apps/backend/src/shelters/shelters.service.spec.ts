import { Test, TestingModule } from '@nestjs/testing';
import { SheltersService } from './shelters.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ShelterService (integration)', () => {
  let service: SheltersService;
  let prisma: PrismaService;
  let testUserId: number;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SheltersService, PrismaService],
    }).compile();

    service = module.get<SheltersService>(SheltersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prisma.shelterProfile.deleteMany();
    await prisma.pfcUser.deleteMany();

    // Crée d’abord un utilisateur
    const user = await prisma.pfcUser.create({
      data: {
        email: 'refuge@test.com',
        password: 'hashedpassword',
        role: 'shelter', // respecte ton enum UserRole
      },
    });

    // Puis crée le refuge lié à cet utilisateur
    await prisma.shelterProfile.create({
      data: {
        pfcUserId: user.id,
        siret: '12345678901234',
        shelterName: 'Refuge Test',
        description: 'Un refuge fictif',
        logo: null,
      },
    });

    testUserId = user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return all shelters', async () => {
    const shelters = await service.findAll();
    expect(shelters.length).toBe(1);
    expect(shelters[0].shelterName).toBe('Refuge Test');
  });

  it('should find a shelter by id', async () => {
    const shelter = await service.findOne(testUserId);
    expect(shelter?.shelterName).toBe('Refuge Test');
  });

  it('should create a new shelter', async () => {
    const newUser = await prisma.pfcUser.create({
      data: {
        email: 'nouveau@test.com',
        password: 'hashedpassword',
        role: 'shelter',
      },
    });

    const created = await service.create({
      pfcUserId: newUser.id,
      siret: '98765432109876',
      shelterName: 'Refuge Nouveau',
      description: 'Un nouveau refuge',
      logo: null,
    });

    expect(created.shelterName).toBe('Refuge Nouveau');
  });

  it('should update a shelter', async () => {
    const updated = await service.update(testUserId, { shelterName: 'Refuge Modifié' });
    expect(updated.shelterName).toBe('Refuge Modifié');
  });

  it('should remove a shelter', async () => {
    await service.remove(testUserId);
    const shelter = await prisma.shelterProfile.findUnique({ where: { pfcUserId: testUserId } });
    expect(shelter).toBeNull();
  });
});
