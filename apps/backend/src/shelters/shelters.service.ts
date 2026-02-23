import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateShelterProfileDto, UpdateShelterProfileDto } from "@projet/shared-types";

@Injectable()
export class ShelterService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateShelterProfileDto) {
    return this.prisma.shelterProfile.create({ data });
  }

  async findAll(limit?: number) {
  return this.prisma.shelterProfile.findMany({
    where: { user: { deletedAt: null } },
    take: limit, // Ajout de la limite
    orderBy: { // Ajout du tri
        user: {
          createdAt: 'desc'
        }
      },
    include: {
      user: { 
        include: { 
          animals: { include: { species: true } } 
        } 
      },
    },
  });
}

async findOne(id: number) {
  const shelter = await this.prisma.shelterProfile.findUnique({
    where: { pfcUserId: id },
    include: {
      user: { 
        include: { 
          animals: {
            include: { species: true,
              shelter: {
                include: { shelterProfile: true } 
              }
             }
          } 
        } 
      },
    },
  });

  if (!shelter || shelter.user.deletedAt) {
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

  async remove(id: number) {
    return this.prisma.shelterProfile.delete({
      where: { pfcUserId: id },
    });
  }
}
