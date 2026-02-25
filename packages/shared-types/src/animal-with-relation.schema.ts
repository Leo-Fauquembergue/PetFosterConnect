import { z } from "zod";
import { AnimalSchema } from "./animal.schema";

// Schéma enrichi avec les relations
export const AnimalWithRelationsSchema = AnimalSchema.extend({
  species: z
    .object({
      id: z.number().int().positive(),
      name: z.string(),
    })
    .optional(),

  shelter: z
    .object({
      id: z.number().int().positive(),
      shelterProfile: z
        .object({
          shelterName: z.string(),
        })
        .optional(),
    })
    .optional(),
});

// Type dérivé
export type AnimalWithRelations = z.infer<typeof AnimalWithRelationsSchema>;
