import { z } from "zod";

// ENUM
export const HousingTypeEnum = z.enum(["house", "apartment", "other"]);
export type HousingType = z.infer<typeof HousingTypeEnum>;

// PROFIL PARTICULIER (Individual)
export const IndividualProfileSchema = z.object({
  pfcUserId: z.int().positive(), // Clé étrangère = Clé Primaire (1-1)

  // Critères de logement
  housingType: HousingTypeEnum.nullable().optional(),
  surface: z.int().positive().nullable().optional(), // En m²

  // Critères de matching (Booléens)
  haveGarden: z.boolean().default(false),
  haveAnimals: z.boolean().default(false),
  haveChildren: z.boolean().default(false),

  // Disponibilité Famille d'Accueil
  availableFamily: z.boolean().default(false),
  availableTime: z.string().nullable().optional(), // Description libre

  createdAt: z.date(),
  updatedAt: z.date().nullable().optional(),
});

export type IndividualProfile = z.infer<typeof IndividualProfileSchema>;

// DTO : Mise à jour (Front -> Back)
export const UpdateIndividualProfileSchema = IndividualProfileSchema.omit({
  pfcUserId: true, // L'ID ne change pas
  createdAt: true,
  updatedAt: true,
}).partial(); // Tout est optionnel pour une mise à jour partielle

export type UpdateIndividualProfileDto = z.infer<typeof UpdateIndividualProfileSchema>;

// PROFIL REFUGE (Shelter)
export const ShelterProfileSchema = z.object({
  pfcUserId: z.int().positive(), // Clé étrangère = Clé Primaire (1-1)

  siret: z.string().length(14, { error: "Le SIRET doit faire exactement 14 caractères" }),
  shelterName: z.string().min(2).max(100),
  description: z.string().nullable().optional(),
  logo: z.url().nullable().optional(),

  createdAt: z.date(),
  updatedAt: z.date().nullable().optional(),
});

export type ShelterProfile = z.infer<typeof ShelterProfileSchema>;

// DTO : Création (Front -> Back)
export const CreateShelterProfileSchema = ShelterProfileSchema.omit({
  createdAt: true,
  updatedAt: true,
});
export type CreateShelterProfileDto = z.infer<typeof CreateShelterProfileSchema>;

// DTO : Mise à jour (Front -> Back)
export const UpdateShelterProfileSchema = ShelterProfileSchema.omit({
  pfcUserId: true, // l'ID ne change pas
  createdAt: true,
  updatedAt: true,
}).partial();
export type UpdateShelterProfileDto = z.infer<typeof UpdateShelterProfileSchema>;
