import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(userId: number, animalId: number) {
    const animal = await this.prisma.animal.findUnique({
      where: { id: animalId },
    });

    if (!animal) {
      throw new NotFoundException("Cet animal n'existe pas.");
    }

    const existingBookmark = await this.prisma.bookmark.findUnique({
      where: {
        pfcUserId_animalId: {
          pfcUserId: userId,
          animalId: animalId,
        },
      },
    });

    if (existingBookmark) {
      await this.prisma.bookmark.delete({
        where: {
          pfcUserId_animalId: {
            pfcUserId: userId,
            animalId: animalId,
          },
        },
      });
      
      return { bookmarked: false, message: "Retiré des favoris" };
    }

    await this.prisma.bookmark.create({
      data: {
        pfcUserId: userId,
        animalId: animalId,
      },
    });

    return { bookmarked: true, message: "Ajouté aux favoris" };
  }

  async findAllByUser(userId: number) {
    return this.prisma.bookmark.findMany({
      where: { pfcUserId: userId },
      include: {
        animal: {
          include: { species: true },
        },
      },
    });
  }
}