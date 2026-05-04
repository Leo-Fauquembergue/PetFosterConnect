import { SetMetadata } from "@nestjs/common";

export type ResourceType = "animal" | "application" | "user";

export interface CheckOwnerOptions {
  type: ResourceType;
  /**
   * Le nom du paramètre dans la requête (ex: 'id', 'animalId')
   */
  idParam: string;
}

export const CHECK_OWNER_KEY = "check_owner";

/**
 * Décorateur pour spécifier quelle ressource doit être vérifiée par le ResourceOwnerGuard.
 */
export const CheckOwner = (options: CheckOwnerOptions) => SetMetadata(CHECK_OWNER_KEY, options);
