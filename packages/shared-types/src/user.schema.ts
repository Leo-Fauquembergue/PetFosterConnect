import { z } from "zod";

// 1. On crée le véritable Enum TypeScript (utilisable comme valeur ET comme type)
export enum UserRole {
  individual = "individual",
  shelter = "shelter",
  admin = "admin",
}

// 2. On utilise z.enum() au lieu de z.nativeEnum()
export const UserRoleEnum = z.enum(UserRole, {
  error: "Veuillez choisir un type de compte valide",
});

// SCHÉMA PRINCIPAL (Entité BDD)
export const UserSchema = z.object({
  id: z.int().positive().optional(),
  email: z.email({ error: "Format d'email invalide" }).max(255),
  password: z
    .string()
    .min(12, { error: "Le mot de passe doit faire au moins 12 caractères" })
    .regex(/[A-Z]/, { error: "Une majuscule requise" })
    .regex(/[0-9]/, { error: "Un chiffre requis" })
    .regex(/[^a-zA-Z0-9]/, { error: "Un caractère spécial requis" }),
  role: UserRoleEnum, // On l'utilise ici
  phoneNumber: z.string().max(20).optional(),
  address: z.string().max(255).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  deletedAt: z.date().nullable().optional(),
}).strict();

export type User = z.infer<typeof UserSchema>;

// DTOs (Data Transfer Objects)

export const RegisterSchema = UserSchema.pick({
  email: true,
  password: true,
  role: true,
  phoneNumber: true,
  address: true,
}).extend({
  siret: z.string().length(14).optional().or(z.literal("")),
  shelterName: z.string().min(2).optional().or(z.literal("")),
}).strict();

export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.email({ error: "Email invalide" }),
  password: z.string().min(1, { error: "Mot de passe requis" }),
}).strict();

export type LoginDto = z.infer<typeof LoginSchema>;

export const UpdateUserSchema = UserSchema.pick({
  email: true,
  password: true,
  phoneNumber: true,
  address: true,
  deletedAt: true,
}).partial().strict();

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

export const UpdatePasswordSchema = z.object({
  // Remplacement de "message" par "error"
  oldPassword: z.string().min(1, { error: "Ancien mot de passe requis" }),
  newPassword: z
    .string()
    .min(12, { error: "Le mot de passe doit faire au moins 12 caractères" })
    .regex(/[A-Z]/, { error: "Une majuscule requise" })
    .regex(/[0-9]/, { error: "Un chiffre requis" })
    .regex(/[^a-zA-Z0-9]/, { error: "Un caractère spécial requis" }),
}).strict();

export type UpdatePasswordDto = z.infer<typeof UpdatePasswordSchema>;