import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService){}

  async toggle(userId: number, animalId: number){
    //1: on vérifie que l'animal existe vraiment
    const animal = await this.prisma.animal.findUnique({
      where: { id: animalId },
    });

    if (!animal){
      throw new NotFoundException("Cet animal n'existe pas.");
    }

    //2: On chercher si le favoris existe déjà
    //Note: pfcUserId_animalId est le nom de la clé composite générée par prisma
    const existingBoomark = await this.prisma.bookmark.findUnique({
      where: {
        pfcUserId_animalId: {
          pfcUserId: userId,
          animalId: animalId,
        },
      },
    });

    if (existingBoomark){
      //3. Il existe ? On le supprime (Toggle OFF)
      await this.prisma.bookmark.delete({
        where: {
          pfcUserId_animalId: {
            pfcUserId: userId,
            animalId: animalId,
          },
        },
      });
      return { bookmarked: false, message: "Retiré des favoris"};
    }

   // 4. Il n'existe pas ? On le crée (Toggle ON)
    await this.prisma.bookmark.create({
      data: {
        pfcUserId: userId,
        animalId: animalId,
      },
    });
    return { bookmarked: true, message: "Ajouté aux favoris" };
  }

  //Pour afficher la lsit des favories sur le profil utilisateur
  async findAllByUser(userId: number){
    return this.prisma.bookmark.findMany({
      where: {pfcUserId: userId},
      include: {
        animal: {
          include: { species: true}, // On embarque les infos pour les cards
        },
      },
    });
  }

}