import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(userId: number, animalId: number) {
    // 1. Vérification de l'existence de l'animal
    const animal = await this.prisma.animal.findUnique({
      where: { id: animalId },
    });

    if (!animal || animal.deletedAt) {
      throw new NotFoundException("Cet animal n'existe pas ou a été supprimé.");
    }

    try {
      // 2. Tentative de création (Optimisme : on veut ajouter le favori)
      // Si plusieurs requêtes arrivent en même temps, une seule réussira ici.
      await this.prisma.bookmark.create({
        data: {
          pfcUserId: userId,
          animalId: animalId,
        },
      });

      return { bookmarked: true, message: "Ajouté aux favoris" };
    } catch (error) {
      // 3. Gestion de la Race Condition via les codes d'erreur Prisma
      // P2002 : Violation de contrainte d'unicité (déjà présent)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        try {
          // Si le bookmark existait déjà, on le supprime (effet Toggle)
          await this.prisma.bookmark.delete({
            where: {
              pfcUserId_animalId: {
                pfcUserId: userId,
                animalId: animalId,
              },
            },
          });
          return { bookmarked: false, message: "Retiré des favoris" };
        } catch (deleteError) {
          // P2025 : L'enregistrement à supprimer n'existe pas
          // Arrive si une autre requête l'a supprimé entre le P2002 et ici.
          if (
            deleteError instanceof Prisma.PrismaClientKnownRequestError &&
            deleteError.code === "P2025"
          ) {
            return { bookmarked: false, message: "Retiré des favoris" };
          }
          throw deleteError;
        }
      }
      throw error;
    }
  }

  async findAllByUser(userId: number) {
    return this.prisma.bookmark.findMany({
      where: {
        pfcUserId: userId,
        // 🛡️ CORRECTION : Exclut les bookmarks d'animaux ou refuges supprimés
        animal: { deletedAt: null, shelter: { deletedAt: null } },
      },
      // 🚀 OPTIMISATION : On ne sélectionne que les champs strictement nécessaires pour l'affichage de la carte
      // On évite ainsi les jointures coûteuses (comme shelter > shelterProfile)
      select: {
        pfcUserId: true,
        animalId: true,
        createdAt: true,
        animal: {
          select: {
            id: true,
            name: true,
            photos: true,
            description: true,
            species: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
