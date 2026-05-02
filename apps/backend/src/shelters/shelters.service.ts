import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateShelterProfileDto, UpdateShelterProfileDto } from "@projet/shared-types";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SheltersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateShelterProfileDto) {
    return this.prisma.shelterProfile.create({ data });
  }

  async findAll(limit?: number) {
    return this.prisma.shelterProfile.findMany({
      where: { user: { deletedAt: null } },
      take: limit, // Ajout de la limite
      orderBy: {
        // Ajout du tri
        user: {
          createdAt: "desc",
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            address: true,
            deletedAt: true,
            // 🛡️ CORRECTION SÉCURITÉ : Bombe Mémoire (OOM) désamorcée.
            // On remplace le chargement de toute la table Animal par un compteur.
            // 🛡️ CORRECTION : On ne compte que les animaux non supprimés
            _count: { select: { animals: { where: { deletedAt: null } } } },
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const shelter = await this.prisma.shelterProfile.findUnique({
      where: { pfcUserId: id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            address: true,
            deletedAt: true,
            animals: {
              where: { deletedAt: null }, // 🛡️ CORRECTION : Exclut les animaux supprimés
              include: {
                species: true,
              },
            },
          },
        },
      },
    });

    if (!shelter || shelter.user?.deletedAt) {
      throw new NotFoundException("Refuge introuvable");
    }

    return shelter;
  }

  async update(id: number, data: UpdateShelterProfileDto) {
    return this.prisma.shelterProfile.update({
      where: { pfcUserId: id },
      data,
    });
  }
}
