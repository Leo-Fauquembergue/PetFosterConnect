import type { IndividualProfile } from "@projet/shared-types";

/**
 * Interface minimaliste pour les besoins de l'animal
 * Compatible avec Animal (Backend) et UIAnimal (Frontend)
 */
export interface MatchingAnimal {
  needGarden?: boolean | null;
  acceptChildren?: boolean | null;
  acceptOtherAnimals?: boolean | null;
}

/**
 * Résultat du check de matching
 */
export interface MatchingResult {
  shouldWarn: boolean;
  warningMessages: string[];
}

/**
 * Vérifie la compatibilité entre un animal et le profil d'un utilisateur.
 * Cette fonction est pure et minimaliste (KISS).
 *
 * @param animal Les besoins de l'animal
 * @param profile Le profil de l'adoptant
 * @returns Un objet indiquant s'il faut afficher un avertissement et les messages associés.
 */
export function checkMatchingWarnings(
  animal: MatchingAnimal,
  profile: Partial<IndividualProfile> | null | undefined
): MatchingResult {
  const warningMessages: string[] = [];

  // Si pas de profil du tout (ex: non connecté ou profil non créé)
  if (!profile) {
    return {
      shouldWarn: true,
      warningMessages: [
        "Votre profil est incomplet. Veuillez renseigner vos informations pour vérifier la compatibilité.",
      ],
    };
  }

  // 1. Besoin de jardin (Animal strict)
  if (animal.needGarden) {
    if (profile.haveGarden === false) {
      warningMessages.push("L'animal a besoin d'un jardin, ce que vous n'avez pas.");
    } else if (profile.haveGarden === null || profile.haveGarden === undefined) {
      warningMessages.push(
        "L'animal a besoin d'un jardin, ce qui n'est pas précisé dans votre profil."
      );
    }
  }

  // 2. Acceptation des enfants (Animal restrictif)
  // Si l'animal n'accepte PAS les enfants, on vérifie si l'utilisateur en a
  if (animal.acceptChildren === false) {
    if (profile.haveChildren === true) {
      warningMessages.push("L'animal n'accepte pas les enfants, et vous en avez.");
    } else if (profile.haveChildren === null || profile.haveChildren === undefined) {
      warningMessages.push(
        "L'animal n'accepte pas les enfants. Assurez-vous que votre foyer est adapté car l'information manque dans votre profil."
      );
    }
  }

  // 3. Acceptation des autres animaux (Animal restrictif)
  if (animal.acceptOtherAnimals === false) {
    if (profile.haveAnimals === true) {
      warningMessages.push("L'animal n'accepte pas les autres animaux, et vous en avez.");
    } else if (profile.haveAnimals === null || profile.haveAnimals === undefined) {
      warningMessages.push(
        "L'animal n'accepte pas les autres animaux. Assurez-vous que votre foyer est adapté car l'information manque dans votre profil."
      );
    }
  }

  return {
    shouldWarn: warningMessages.length > 0,
    warningMessages,
  };
}
