import { z } from "zod";

// 1. On crée le véritable Enum TypeScript (utilisable comme valeur ET comme type)
export enum UserRole {
  individual = "individual",
  shelter = "shelter",
  admin = "admin",
}

// 2. On utilise z.nativeEnum()
export const UserRoleEnum = z.nativeEnum(UserRole, {
  error: "Veuillez choisir un type de compte valide",
});

// SCHÉMA PRINCIPAL (Entité BDD)
export const UserSchema = z.object({
  id: z.number().int().positive().optional(),
  email: z.email({ error: "Format d'email invalide" }).max(255),
  password: z
    .string()
    .min(12, { error: "Le mot de passe doit faire au moins 12 caractères" })
    .regex(/[A-Z]/, { error: "Le mot de passe doit contenir au moins une majuscule" })
    .regex(/[a-z]/, { error: "Le mot de passe doit contenir au moins une minuscule" })
    .regex(/[0-9]/, { error: "Le mot de passe doit contenir au moins un chiffre" })
    .regex(/[^A-Za-z0-9]/, { error: "Le mot de passe doit contenir au moins un caractère spécial" }),
  role: UserRoleEnum,
  phoneNumber: z.string().max(20).nullable().optional(),
  address: z.string().max(255).nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().nullable().optional(),
  deletedAt: z.date().nullable().optional(),
}).strict();

export type User = z.infer<typeof UserSchema>;

// DTOs (Data Transfer Objects)
export const RegisterSchema = UserSchema.pick({
  email: true,
  password: true,
  phoneNumber: true,
  address: true,
}).extend({
  // 🛡️ CORRECTION SÉCURITÉ : Faille Mass Assignment (Escalade de privilège) bloquée.
  // On restreint l'enum accepté ici à individual et shelter uniquement.
  role: z.enum([UserRole.individual, UserRole.shelter], { 
    error: "Escalade de privilèges interdite" 
  }),
  siret: z.string().length(14).optional().or(z.literal("")),
  shelterName: z.string().min(2).optional().or(z.literal("")),
}).strict();

export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.email({ error: "Email invalide" }),
  password: z.string().min(1, { error: "Mot de passe requis" }),
}).strict();

export type LoginDto = z.infer<typeof LoginSchema>;

// CORRECTION SÉCURITÉ : Retrait exclusif de "password" et "deletedAt" pour empêcher le Mass Assignment
export const UpdateUserSchema = UserSchema.pick({
  email: true,
  phoneNumber: true,
  address: true,
}).partial().strict();

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

export const UpdatePasswordSchema = z.object({
  oldPassword: z.string().min(1, { error: "Ancien mot de passe requis" }),
  newPassword: z
    .string()
    .min(12, { error: "Le mot de passe doit faire au moins 12 caractères" })
    .regex(/[A-Z]/, { error: "Le mot de passe doit contenir au moins une majuscule" })
    .regex(/[a-z]/, { error: "Le mot de passe doit contenir au moins une minuscule" })
    .regex(/[0-9]/, { error: "Le mot de passe doit contenir au moins un chiffre" })
    .regex(/[^A-Za-z0-9]/, { error: "Le mot de passe doit contenir au moins un caractère spécial" }),
}).strict();

export type UpdatePasswordDto = z.infer<typeof UpdatePasswordSchema>;