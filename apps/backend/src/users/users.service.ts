import { Injectable, Logger } from "@nestjs/common";
import { Prisma, UserRole } from "@prisma/client";
import { RegisterDto } from "@projet/shared-types";
import { UpdateUserWithIndividualProfileDto, UpdateUserWithShelterProfileDto ,UpdatePasswordDto } from "@projet/shared-types"; 

import * as argon2 from "argon2";
import { PrismaService } from "../prisma/prisma.service";

// Objet réutilisable pour exclure le password proprement partout
const safeUserSelect = {
  id: true,
  email: true,
  role: true,
  phoneNumber: true,
  address: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // --- Création d'un utilisateur ---
  async create(data: RegisterDto) {
    const hashedPassword = await argon2.hash(data.password);

    // ⚡ Utilisation stricte de Prisma.PfcUserCreateInput
    const userData: Prisma.PfcUserCreateInput = {
      email: data.email,
      password: hashedPassword,
      role: data.role as UserRole,
      phoneNumber: data.phoneNumber,
      address: data.address,
    };

    if (data.role === 'shelter') {
      if (!data.siret || !data.shelterName) {
        throw new Error("Le SIRET et le nom du refuge sont obligatoires pour un compte Association.");
      }
  
      userData.shelterProfile = {
        create: {
          siret: data.siret,
          shelterName: data.shelterName,
          description: "Nouveau refuge inscrit",
        },
      };
    }
  
    return this.prisma.pfcUser.create({
      data: userData,
      select: safeUserSelect, // 🛡️ SÉCURITÉ : Ne renvoie pas le password
    });
  }

  // --- Récupérer tous les utilisateurs (SÉCURISÉ) ---
  findAll() {
    return this.prisma.pfcUser.findMany({
      select: safeUserSelect
    });
  }

  // --- Récupérer un utilisateur par ID (SÉCURISÉ) ---
  findOne(id: number) {
    return this.prisma.pfcUser.findUnique({ 
      where: { id },
      select: safeUserSelect
    });
  }

  // --- Récupérer un utilisateur par email ---
  async findByEmail(email: string) {
    return this.prisma.pfcUser.findUnique({ where: { email } });
  }

  // --- Mise à jour d'un utilisateur ---
  async update(id: number, data: Partial<RegisterDto>) {
    // ⚡ Typage strict et assignation explicite
    const updateData: Prisma.PfcUserUpdateInput = {};

    if (data.email) updateData.email = data.email;
    if (data.phoneNumber) updateData.phoneNumber = data.phoneNumber;
    if (data.address) updateData.address = data.address;

    if (data.password) {
      updateData.password = await argon2.hash(data.password);
    }

    if (data.role) {
      updateData.role = data.role as UserRole;
    }

    return this.prisma.pfcUser.update({
      where: { id },
      data: updateData,
      select: safeUserSelect, // 🛡️ SÉCURITÉ
    });
  }

  // --- Suppression (soft delete) ---
  remove(id: number) {
    return this.prisma.pfcUser.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: safeUserSelect, // 🛡️ SÉCURITÉ
    });
  }

  // --- Validation login (email + mot de passe) ---
  async validateUser(email: string, plainPassword: string) {
    const user = await this.findByEmail(email);

    if (!user) return null;

    const isValid = await argon2.verify(user.password, plainPassword);
    if (!isValid) return null;

    // 🛡️ SÉCURITÉ : On retire le password de l'objet retourné au login
    const { password, ...safeUser } = user;

    return safeUser;
  }

  // --- Récupérer le profil enrichi ---
  async getProfile(userId: number) {
    if (!userId || Number.isNaN(userId)) {
      throw new Error("Invalid userId");
    }
    return this.prisma.pfcUser.findUnique({
      where: { id: userId },
      select: {
          ...safeUserSelect, // 🛡️ Utilise la base sécurisée
          individualProfile: true, 
          shelterProfile: true, 
      },
    });
  }
  
  // --- Mise à jour du mot de passe ---
  async updatePassword(userId: number, dto: UpdatePasswordDto) {
    try {
      const user = await this.prisma.pfcUser.findUnique({ where: { id: userId } });
      if (!user) throw new Error("Utilisateur introuvable");
  
      const isValid = await argon2.verify(user.password, dto.oldPassword);
      if (!isValid) throw new Error("Ancien mot de passe incorrect");
  
      const hashed = await argon2.hash(dto.newPassword);

      return await this.prisma.pfcUser.update({
        where: { id: userId },
        data: { password: hashed },
        select: safeUserSelect, // 🛡️ SÉCURITÉ
      });
    } catch (err) {
      Logger.error("Erreur updatePassword:", err);
      throw err;
    }
  }
  
  // --- Mise à jour profil individuel ---
  async updateIndividualProfile(id: number, dto: UpdateUserWithIndividualProfileDto) {
    return this.prisma.pfcUser.update({
      where: { id },
      data: {
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        address: dto.address,
        individualProfile: {
          upsert: {
            update: {
              surface: dto.surface,
              housingType: dto.housingType,
              haveGarden: dto.haveGarden ?? false,
              haveAnimals: dto.haveAnimals ?? false,
              haveChildren: dto.haveChildren ?? false,
              availableFamily: dto.availableFamily,
              availableTime: dto.availableTime,
            },
            create: {
              surface: dto.surface,
              housingType: dto.housingType,
              haveGarden: dto.haveGarden ?? false,
              haveAnimals: dto.haveAnimals ?? false,
              haveChildren: dto.haveChildren ?? false,
              availableFamily: dto.availableFamily,
              availableTime: dto.availableTime,
            },
          },
        },
      },
      select: { ...safeUserSelect, individualProfile: true }, // 🛡️ Remplace le 'include' pour filtrer le mot de passe
    });
  }
  
  // --- Mise à jour profil refuge ---
  async updateShelterProfile(id: number, dto: UpdateUserWithShelterProfileDto) {
    const user = await this.prisma.pfcUser.findUnique({
      where: { id },
      include: { shelterProfile: true },
    });

    if (!user) {
      throw new Error("Utilisateur introuvable");
    }
  
    try {
      return await this.prisma.pfcUser.update({
        where: { id },
        data: {
          email: dto.email ?? user.email,
          phoneNumber: dto.phoneNumber ?? user.phoneNumber,
          address: dto.address ?? user.address,
          shelterProfile: {
            upsert: {
              update: {
                siret: dto.siret ?? user.shelterProfile?.siret,
                shelterName: dto.shelterName ?? user.shelterProfile?.shelterName,
                description: dto.description ?? user.shelterProfile?.description ?? null,
                logo: dto.logo ?? user.shelterProfile?.logo ?? null,
              },
              create: {
                siret: dto.siret ?? "00000000000000",
                shelterName: dto.shelterName ?? "Nom inconnu",
                description: dto.description ?? null,
                logo: dto.logo ?? null,
              },
            },
          },
        },
        select: { ...safeUserSelect, shelterProfile: true }, // 🛡️ Remplace le 'include' pour sécuriser
      });
    } catch (err) {
      Logger.error("Erreur Prisma updateShelterProfile:", err);
      throw new Error("Impossible de mettre à jour le profil refuge");
    }
  }
}