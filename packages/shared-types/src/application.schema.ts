import { z } from "zod";

// ENUMS
export const ApplicationTypeEnum = z.enum(["adoption", "foster"]);
export type ApplicationType = z.infer<typeof ApplicationTypeEnum>;

export const ApplicationStatusEnum = z.enum(["pending", "approved", "rejected", "cancelled"]);
export type ApplicationStatus = z.infer<typeof ApplicationStatusEnum>;

// APPLICATION (Demande)
export const ApplicationSchema = z.object({
  // Clé Primaire Composite (User + Animal)
  pfcUserId: z.int().positive(), // Le candidat (FK)
  animalId: z.int().positive(), // L'animal (FK)

  message: z
    .string()
    .min(20, { error: "La motivation doit faire au moins 20 caractères" })
    .max(2000), // Limite raisonnable pour la BDD

  applicationType: ApplicationTypeEnum, // Adoption ou FA
  applicationStatus: ApplicationStatusEnum.default("pending"), // En attente par défaut

  createdAt: z.date(),
  updatedAt: z.date().nullable().optional(),
  deletedAt: z.date().nullable().optional(), // Archivage (Soft Delete)
});

export type Application = z.infer<typeof ApplicationSchema>;

// DTOs (Data Transfer Objects)

// CREATE : Créer une demande (Envoyé par le candidat)
export const CreateApplicationSchema = ApplicationSchema.pick({
  animalId: true, // Obligatoire
  message: true, // Lettre de motivation
  applicationType: true, // "Je veux l'adopter" ou "Je veux l'accueillir"
});
//! Note : pfc_user_id n'est pas envoyé par le front, il est extrait du Token JWT

export type CreateApplicationDto = z.infer<typeof CreateApplicationSchema>;

// UPDATE STATUT : Répondre à une demande (Par le Refuge)
export const UpdateApplicationStatusSchema = z.object({
  applicationStatus: ApplicationStatusEnum,
});

export type UpdateApplicationStatusDto = z.infer<typeof UpdateApplicationStatusSchema>;
