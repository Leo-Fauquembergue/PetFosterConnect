import { AnimalsService } from './animals.service';
import { NotFoundException } from '@nestjs/common';

describe('AnimalsService', () => {
    let service: AnimalsService;

    const mockPrisma = {
        animal: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        
        service = new AnimalsService(mockPrisma as any);
    });

    describe('findOne', () => {
        it('devrait retourner un animal spécifique avec son statut de favori', async () => {
            const fakeAnimal = {
                id: 1,
                name: 'Rex',
                bookmarks: [],
                species: { name: 'Chien' },
                shelter: { shelterProfile: { name: 'SPA' } },
            };

            mockPrisma.animal.findUnique.mockResolvedValue(fakeAnimal);

            const result = await service.findOne(1);

            expect(result.name).toBe('Rex');
            expect(result.isBookmarked).toBe(false);
        });

        it('devrait lancer une erreur 404 si l animal n existe pas', async () => {
            mockPrisma.animal.findUnique.mockResolvedValue(null);
            await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
        });
    });

    describe('create', () => {
        it('devrait créer un animal et formater correctement les relations Prisma', async () => {
            const dto = {
                name: 'Pongo',
                speciesId: 10,
                weight: 12.5,
            };
            const userId = 5;

            mockPrisma.animal.create.mockResolvedValue({ id: 100, ...dto });

            const result = await service.create(dto as any, userId);

            expect(mockPrisma.animal.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    name: 'Pongo',
                    shelter: { connect: { id: userId } },
                    species: { connect: { id: 10 } },
                })
            });
            expect(result.id).toBe(100);
        });
    });

    describe('findAllByShelter', () => {
        it('devrait filtrer les animaux par l ID du refuge', async () => {
            const shelterId = 1;
            const fakeList = [{ id: 1, name: 'Rex' }, { id: 2, name: 'Max' }];
            
            mockPrisma.animal.findMany.mockResolvedValue(fakeList);

            const result = await service.findAllByShelter(shelterId);

            expect(mockPrisma.animal.findMany).toHaveBeenCalledWith({
                where: { pfcUserId: shelterId },
                include: expect.any(Object)
            });
            expect(result).toHaveLength(2);
        });
    });

    describe('update', () => {
        it('devrait modifier les données de l animal', async () => {
            const dto = { name: 'Rex Junior' };
            mockPrisma.animal.update.mockResolvedValue({ id: 1, name: 'Rex Junior' });

            const result = await service.update(1, dto);

            expect(mockPrisma.animal.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: expect.objectContaining({ name: 'Rex Junior' })
            });
            expect(result.name).toBe('Rex Junior');
        });
    });

    describe('remove', () => {
        it('devrait faire un "soft delete" en mettant à jour la date deletedAt', async () => {
            mockPrisma.animal.update.mockResolvedValue({ id: 1, deletedAt: new Date() });

            await service.remove(1);

            expect(mockPrisma.animal.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { deletedAt: expect.any(Date) }
            });
        });
    });
});