import { z } from "zod";
import { UpdateUserSchema } from "./user.schema"; // 🛡️ Toujours utiliser le DTO sécurisé
import { UpdateShelterProfileSchema, UpdateIndividualProfileSchema } from "./profile.schema";

// Fusion des deux schémas de MISE À JOUR (déjà purgés des champs sensibles et déjà .partial())
export const UpdateUserWithShelterProfileSchema = UpdateUserSchema.extend(
  UpdateShelterProfileSchema.shape
);

export type UpdateUserWithShelterProfileDto = z.infer<typeof UpdateUserWithShelterProfileSchema>;


export const UpdateUserWithIndividualProfileSchema = UpdateUserSchema.extend(
  UpdateIndividualProfileSchema.shape
);

export type UpdateUserWithIndividualProfileDto = z.infer<typeof UpdateUserWithIndividualProfileSchema>;