import { z } from "zod";

// ENUM
export const HousingTypeEnum = z.enum(["house", "apartment", "other"], {
  error: "Type de logement invalide",
});
export type HousingType = z.infer<typeof HousingTypeEnum>;

// PROFIL PARTICULIER (Individual)
export const IndividualProfileSchema = z.object({
  pfcUserId: z.number().int().positive(), // Clé étrangère = Clé Primaire (1-1)

  // Critères de logement
  housingType: HousingTypeEnum.nullable().optional(),
  surface: z
    .number({ error: "La surface doit être un nombre" })
    .int()
    .positive({ error: "La surface doit être positive" })
    .nullable()
    .optional(), // En m²

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
  pfcUserId: z.number().int().positive(), // Clé étrangère = Clé Primaire (1-1)

  siret: z
    .string()
    .length(14, { error: "Le SIRET doit faire exactement 14 chiffres" })
    .regex(/^[0-9]+$/, { error: "Le SIRET ne doit contenir que des chiffres" }),
  shelterName: z.string().min(2, { error: "Le nom du refuge est trop court" }).max(100),
  description: z.string().nullable().optional(),
  logo: z.url({ error: "URL du logo invalide" }).nullable().optional(),

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
  siret: true, // 🛡️ SÉCURITÉ : Le SIRET est l'identifiant légal, il ne doit pas être modifiable
  createdAt: true,
  updatedAt: true,
}).partial();
export type UpdateShelterProfileDto = z.infer<typeof UpdateShelterProfileSchema>;
