import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { RequestWithUser } from "@projet/shared-types";
import { CreateAnimalDto, UpdateAnimalDto } from "@projet/shared-types";
import { PrismaService } from "../prisma/prisma.service";

// Animal avec relations species + shelterProfile
type AnimalWithRelations = Prisma.AnimalGetPayload<{
  include: {
    species: true;
    shelter: { select: { id: true; email: true; phoneNumber: true; shelterProfile: true } };
  };
}>;

// Animal enrichi avec isBookmarked
type AnimalWithBookmark = AnimalWithRelations & { isBookmarked: boolean };

type UserPayload = RequestWithUser["user"];

@Injectable()
export class AnimalsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAnimalDto, userId: number) {
    const data: Prisma.AnimalCreateInput = {
      name: dto.name,
      age: dto.age,
      description: dto.description,
      sex: dto.sex,
      weight: dto.weight ? new Prisma.Decimal(dto.weight) : null,
      height: dto.height,
      animalStatus: dto.animalStatus,
      photos: dto.photos === null ? Prisma.DbNull : dto.photos,
      acceptOtherAnimals: dto.acceptOtherAnimals,
      acceptChildren: dto.acceptChildren,
      needGarden: dto.needGarden,
      treatment: dto.treatment,
      shelter: { connect: { id: userId } }, // relation vers PfcUser
      species: { connect: { id: dto.speciesId } }, // relation vers Species
    };
    return this.prisma.animal.create({ data });
  }

  async findAll(includeDeleted = false, limit?: number) {
    return this.prisma.animal.findMany({
      where: {
        // Si includeDeleted est false, on ne veut que deletedAt: null
        deletedAt: includeDeleted ? undefined : null,
        // Exclut les animaux appartenant à un refuge supprimé (soft delete)
        shelter: includeDeleted ? undefined : { deletedAt: null },
      },
      take: limit, // On applique la limite si elle est fournie
      orderBy: {
        createdAt: "desc", // On trie toujours du plus récent au plus ancien
      },
      include: {
        species: true,
        shelter: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            shelterProfile: true, // Sélection explicite et sûre
          },
        },
      },
    });
  }

  async findOne(id: number, userId?: number): Promise<AnimalWithBookmark> {
    const animal = await this.prisma.animal.findUnique({
      where: { id },
      include: {
        species: true,
        shelter: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            shelterProfile: true,
          },
        },
        bookmarks: userId ? { where: { pfcUserId: userId } } : false,
      },
    });

    if (!animal || animal.deletedAt) {
      throw new NotFoundException(`Animal ${id} non trouvé ou supprimé`);
    }

    const isBookmarked = !!animal.bookmarks?.length;

    // On supprime bookmarks du retour pour éviter de l’exposer
    const { bookmarks, ...rest } = animal;
    return { ...rest, isBookmarked };
  }

  async findAllByShelter(userId: number) {
    return this.prisma.animal.findMany({
      where: { pfcUserId: userId, deletedAt: null }, // 🛡️ FILTRE : Exclut les animaux supprimés
      include: {
        species: true, // "Va chercher le nom de l'espèce"
      },
    });
  }

  async update(id: number, updateAnimalDto: UpdateAnimalDto, user: UserPayload) {
    const animal = await this.prisma.animal.findUnique({ where: { id } });

    if (!animal || animal.deletedAt) {
      throw new NotFoundException("Animal introuvable ou supprimé");
    }

    this.checkOwnership(animal.pfcUserId, user, "Vous ne pouvez modifier que vos animaux.");

    // ⚡ Déstructuration élégante et séparation des champs complexes
    const { weight, speciesId, photos, ...restDto } = updateAnimalDto;

    const data: Prisma.AnimalUpdateInput = {
      ...restDto,
    };

    // Traitement spécifique des champs complexes
    if (weight !== undefined) {
      data.weight = weight ? new Prisma.Decimal(weight) : null;
    }

    if (speciesId !== undefined) {
      data.species = { connect: { id: speciesId } };
    }

    if (photos !== undefined) {
      // ⚡ Correction de l'erreur Prisma avec les champs JSON nullables
      data.photos = photos === null ? Prisma.DbNull : photos;
    }

    return this.prisma.animal.update({ where: { id }, data });
  }

  async remove(id: number, user: UserPayload) {
    const animal = await this.prisma.animal.findUnique({ where: { id } });

    if (!animal || animal.deletedAt) {
      throw new NotFoundException("Animal introuvable ou déjà supprimé");
    }

    this.checkOwnership(animal.pfcUserId, user, "Action interdite sur cet animal.");

    if (animal.animalStatus === "adopted" || animal.animalStatus === "foster_care") {
      throw new BadRequestException(
        "Impossible de supprimer un animal déjà adopté ou en famille d'accueil afin de conserver l'historique."
      );
    }

    // ⚡ Utilisation d'une transaction pour éviter les "données fantômes"
    // On supprime l'animal ET on rejette les candidatures en cours
    return this.prisma.$transaction(async (tx) => {
      // 1. Soft-delete de l'animal
      const updatedAnimal = await tx.animal.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      // 2. Rejet automatique des candidatures 'pending' pour cet animal
      await tx.application.updateMany({
        where: {
          animalId: id,
          applicationStatus: "pending",
        },
        data: {
          applicationStatus: "rejected",
        },
      });

      return updatedAnimal;
    });
  }

  /**
   * Vérifie si l'utilisateur est admin ou le propriétaire de la ressource.
   * Empêche les attaques IDOR.
   */
  private checkOwnership(ownerId: number, user: UserPayload, message: string) {
    if (user.role !== "admin" && ownerId !== user.id) {
      throw new ForbiddenException(message);
    }
  }
}
