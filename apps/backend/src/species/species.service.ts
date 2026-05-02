import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SpeciesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.species.findMany({
      where: { deletedAt: null }, // 🛡️ FILTRE : Exclut les espèces supprimées
      orderBy: { name: "asc" },
    });
  }

  async create(data: { name: string }) {
    return this.prisma.species.create({
      data,
    });
  }

  async update(id: number, data: { name: string }) {
    return this.prisma.species.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    // 🛡️ SÉCURITÉ : On vérifie si des animaux (non supprimés) utilisent cette espèce
    const activeAnimalsCount = await this.prisma.animal.count({
      where: { speciesId: id, deletedAt: null },
    });

    if (activeAnimalsCount > 0) {
      throw new BadRequestException(
        `Impossible de supprimer cette espèce : ${activeAnimalsCount} animaux y sont encore rattachés.`
      );
    }

    // 🛡️ CHANGEMENT : Soft-delete au lieu de suppression physique
    return this.prisma.species.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
