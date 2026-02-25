import { z } from "zod";
import { UserSchema } from "./user.schema";
import { UpdateShelterProfileSchema ,UpdateIndividualProfileSchema} from "./profile.schema";

// Fusion des deux schémas
export const UpdateUserWithShelterProfileSchema = UserSchema.merge(UpdateShelterProfileSchema).partial();

export type UpdateUserWithShelterProfileDto = z.infer<typeof UpdateUserWithShelterProfileSchema>;

export const UpdateUserWithIndividualProfileSchema = UserSchema.merge(UpdateIndividualProfileSchema).partial(); 
export type UpdateUserWithIndividualProfileDto = z.infer<typeof UpdateUserWithIndividualProfileSchema>;