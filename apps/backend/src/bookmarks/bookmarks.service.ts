import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(userId: number, animalId: number) {
    // 1. Vérification de l'existence de l'animal (pour renvoyer une 404 propre)
    // On utilise findUnique pour s'assurer que l'animal existe et n'est pas supprimé (soft delete)
    const animal = await this.prisma.animal.findUnique({
      where: { id: animalId },
      select: { id: true, deletedAt: true },
    });

    if (!animal || animal.deletedAt) {
      throw new NotFoundException("Cet animal n'existe pas ou a été supprimé.");
    }

    // 2. Toggle Atomique via une Common Table Expression (CTE) PostgreSQL
    // Cette approche garantit l'atomicité parfaite et évite les race conditions de type TOCTOU.
    // Contrairement à un schéma "findUnique puis create/delete", cette requête est exécutée
    // en une seule opération par le moteur de base de données.
    // - Si le bookmark existe : il est supprimé (CTE 'deleted'). 'inserted' ne fera rien.
    // - Si le bookmark n'existe pas : 'deleted' est vide, 'inserted' crée l'enregistrement.
    const result = await this.prisma.$queryRaw<{ bookmarked: boolean }[]>`
      WITH deleted AS (
        DELETE FROM "bookmark"
        WHERE "pfc_user_id" = ${userId} AND "animal_id" = ${animalId}
        RETURNING 1
      ),
      inserted AS (
        INSERT INTO "bookmark" ("pfc_user_id", "animal_id")
        SELECT ${userId}, ${animalId}
        WHERE NOT EXISTS (SELECT 1 FROM deleted)
        RETURNING 1
      )
      SELECT EXISTS (SELECT 1 FROM inserted) AS bookmarked
    `;

    // SELECT EXISTS(...) retourne toujours au moins une ligne avec un booléen
    const isBookmarked = result[0]?.bookmarked ?? false;

    return {
      bookmarked: isBookmarked,
      message: isBookmarked ? "Ajouté aux favoris" : "Retiré des favoris",
    };
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
