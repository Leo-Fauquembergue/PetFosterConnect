import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Décorateur personnalisé pour définir les rôles autorisés sur une route ou un contrôleur.
 * Exemple d'utilisation : @Roles(UserRole.ADMIN, UserRole.SHELTER)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);