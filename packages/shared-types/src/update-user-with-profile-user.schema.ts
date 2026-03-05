import { z } from "zod";
import { UpdateIndividualProfileSchema, UpdateShelterProfileSchema } from "./profile.schema";
import { UpdateUserSchema } from "./user.schema"; // 🛡️ Toujours utiliser le DTO sécurisé

// Fusion des deux schémas de MISE À JOUR (déjà purgés des champs sensibles et déjà .partial())
export const UpdateUserWithShelterProfileSchema = UpdateUserSchema.extend(
  UpdateShelterProfileSchema.shape
);

export type UpdateUserWithShelterProfileDto = z.infer<typeof UpdateUserWithShelterProfileSchema>;

export const UpdateUserWithIndividualProfileSchema = UpdateUserSchema.extend(
  UpdateIndividualProfileSchema.shape
);

export type UpdateUserWithIndividualProfileDto = z.infer<
  typeof UpdateUserWithIndividualProfileSchema
>;
