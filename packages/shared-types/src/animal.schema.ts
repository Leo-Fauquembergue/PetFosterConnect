import { z } from "zod";

// ENUMS
export const AnimalStatusEnum = z.enum(["available", "adopted", "foster_care", "unavailable"], {
  error: "Statut invalide",
});
export type AnimalStatus = z.infer<typeof AnimalStatusEnum>;

export const AnimalSexEnum = z.enum(["male", "female", "unknown"], {
  error: "Veuillez choisir un sexe valide",
});
export type AnimalSex = z.infer<typeof AnimalSexEnum>;

// ESPÈCE
export const SpeciesSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().max(50, { error: "Le nom de l'espèce est trop long" }),
  createdAt: z.date(),
  updatedAt: z.date().nullable().optional(),
  deletedAt: z.date().nullable().optional(),
});

export type Species = z.infer<typeof SpeciesSchema>;

// ANIMAL
export const AnimalSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1, { error: "Le nom est requis" }).max(100),
  age: z.string().max(50).nullable().optional(),
  // ou string si tu veux "3 mois"
  description: z.string().nullable().optional(),

  // Caractéristiques physiques
  sex: AnimalSexEnum,
  weight: z
    .number({ error: "Le poids doit être un nombre" })
    .positive({ error: "Le poids doit être positif" })
    .nullable()
    .optional(),
  height: z
    .number({ error: "La taille doit être un nombre" })
    .positive({ error: "La taille doit être positive" })
    .nullable()
    .optional(),

  // Gestion et Médias
  animalStatus: AnimalStatusEnum.default("available"),
  photos: z
    .array(z.url({ error: "URL de photo invalide" }))
    .nullable()
    .optional(), // JSONB -> Tableau URLs

  // Critères de Matching
  acceptOtherAnimals: z.boolean().default(false),
  acceptChildren: z.boolean().default(false),
  needGarden: z.boolean().default(false),
  treatment: z.string().nullable().optional(),

  // Clés étrangères
  speciesId: z.number({ error: "L'espèce est requise" }).positive(),
  pfcUserId: z.number().positive(),

  // Dates
  createdAt: z.date(),
  updatedAt: z.date().nullable().optional(),
  deletedAt: z.date().nullable().optional(),
});

export type Animal = z.infer<typeof AnimalSchema>;

// DTOs

// CREATE : Création d'une fiche (Par le Refuge)
export const CreateAnimalSchema = AnimalSchema.omit({
  id: true,
  pfcUserId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).extend({
  // Photos optionnelles mais initialisées en tableau vide par défaut
  photos: z.array(z.url()).default([]),
});

export type CreateAnimalDto = z.infer<typeof CreateAnimalSchema>;

// UPDATE : Modification d'une fiche
export const UpdateAnimalSchema = AnimalSchema.omit({
  id: true,
  pfcUserId: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).partial();

export type UpdateAnimalDto = z.infer<typeof UpdateAnimalSchema>;
