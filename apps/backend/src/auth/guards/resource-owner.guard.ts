import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PrismaService } from "../../prisma/prisma.service";
import { CHECK_OWNER_KEY, CheckOwnerOptions } from "../decorators/check-owner.decorator";

/**
 * Guard générique pour vérifier la possession d'une ressource.
 * Utilise les métadonnées fournies par le décorateur @CheckOwner.
 */
@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.get<CheckOwnerOptions>(CHECK_OWNER_KEY, context.getHandler());

    // Si pas de décorateur, on laisse passer (opt-in)
    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 🛡️ SÉCURITÉ : L'utilisateur doit être authentifié (JwtAuthGuard requis en amont)
    if (!user) {
      throw new ForbiddenException("Accès interdit : utilisateur non authentifié");
    }

    // 👑 PRIVILÈGE : L'admin court-circuite tout (Bypass BDD pour performance)
    if (user.role === "admin") {
      return true;
    }

    const resourceId = Number(request.params[options.idParam]);

    // 🛡️ SÉCURITÉ : Bloque les ID malformés avant toute requête BDD (IDOR prevention)
    if (Number.isNaN(resourceId)) {
      throw new BadRequestException("Accès interdit : format d'ID invalide");
    }

    let ownerId: number | null = null;

    // 🧠 LOGIQUE DE RÉCUPÉRATION DU PROPRIÉTAIRE
    switch (options.type) {
      case "animal": {
        const animal = await this.prisma.animal.findUnique({
          where: { id: resourceId },
          select: { pfcUserId: true, deletedAt: true },
        });

        // 🛡️ SÉCURITÉ : Distinction 404 vs 403.
        // On renvoie 404 si la ressource n'existe pas, même si l'utilisateur n'est pas propriétaire.
        // Cela évite de confirmer l'existence d'une ressource par une 403.
        if (!animal || animal.deletedAt) {
          throw new NotFoundException("Ressource introuvable");
        }
        ownerId = animal.pfcUserId;
        break;
      }

      case "user": {
        // Pour un utilisateur, la ressource est lui-même.
        // On pourrait comparer user.id === resourceId directement (cheap),
        // mais passer par la BDD permet de vérifier si l'utilisateur cible n'est pas supprimé.
        const targetUser = await this.prisma.pfcUser.findUnique({
          where: { id: resourceId },
          select: { id: true, deletedAt: true },
        });

        if (!targetUser || targetUser.deletedAt) {
          throw new NotFoundException("Utilisateur introuvable");
        }
        ownerId = targetUser.id;
        break;
      }

      case "application": {
        // Note: La plupart de nos routes d'applications utilisent animalId, donc options.type 'animal' suffit.
        // Ce cas est gardé pour une future route identifiée uniquement par un ID d'application.
        throw new ForbiddenException("Vérification directe de candidature non implémentée");
      }

      default:
        throw new ForbiddenException(
          "Type de ressource non géré pour la vérification de possession"
        );
    }

    // 🛡️ VÉRIFICATION FINALE : Comparaison d'identité
    if (ownerId !== user.id) {
      throw new ForbiddenException(
        "Accès interdit : vous n'êtes pas le propriétaire de cette ressource"
      );
    }

    return true;
  }
}
