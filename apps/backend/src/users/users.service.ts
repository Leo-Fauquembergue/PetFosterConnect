import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, UserRole } from "@prisma/client";
import {
  RegisterDto,
  UpdatePasswordDto,
  UpdateUserWithIndividualProfileDto,
  UpdateUserWithShelterProfileDto,
} from "@projet/shared-types";
import * as argon2 from "argon2";
import { PrismaService } from "../prisma/prisma.service";

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

  async create(data: RegisterDto) {
    const hashedPassword = await argon2.hash(data.password);

    const userData: Prisma.PfcUserCreateInput = {
      email: data.email,
      password: hashedPassword,
      role: data.role as UserRole,
      phoneNumber: data.phoneNumber,
      address: data.address,
    };

    if (data.role === "shelter") {
      if (!data.siret || !data.shelterName) {
        throw new BadRequestException(
          "Le SIRET et le nom du refuge sont obligatoires pour un compte Association."
        );
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
      select: safeUserSelect,
    });
  }

  findAll() {
    return this.prisma.pfcUser.findMany({ select: safeUserSelect });
  }

  findOne(id: number) {
    return this.prisma.pfcUser.findUnique({
      where: { id },
      select: safeUserSelect,
    });
  }

  async findByEmail(email: string) {
    return this.prisma.pfcUser.findUnique({ where: { email } });
  }

  async update(id: number, data: Partial<RegisterDto>) {
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
      select: safeUserSelect,
    });
  }

  async remove(id: number) {
    const user = await this.prisma.pfcUser.findUnique({
      where: { id },
      include: { individualProfile: true, shelterProfile: true },
    });
    if (!user || user.deletedAt) throw new NotFoundException("Utilisateur introuvable");

    const now = new Date();
    const anonymizedEmail = `deleted_${id}_${now.getTime()}@pfc.internal`;

    return this.prisma.$transaction(async (tx) => {
      // 1. Invalidation immédiate de toutes les sessions
      await tx.refreshToken.deleteMany({ where: { userId: id } });

      // 2. Suppression physique des données de comportement
      await tx.bookmark.deleteMany({ where: { pfcUserId: id } });

      // 3. Gestion des relations d'animaux/candidatures (logique métier)
      if (user.role === "shelter") {
        const shelterAnimals = await tx.animal.findMany({
          where: { pfcUserId: id, deletedAt: null },
          select: { id: true, animalStatus: true },
        });

        if (shelterAnimals.length > 0) {
          const animalIds = shelterAnimals.map((a) => a.id);
          await tx.application.updateMany({
            where: { animalId: { in: animalIds }, applicationStatus: "pending" },
            data: { applicationStatus: "rejected" },
          });

          const animalsToRemoveIds = shelterAnimals
            .filter((a) => a.animalStatus === "available" || a.animalStatus === "unavailable")
            .map((a) => a.id);

          if (animalsToRemoveIds.length > 0) {
            await tx.animal.updateMany({
              where: { id: { in: animalsToRemoveIds } },
              data: { deletedAt: now },
            });
          }
        }
      }

      if (user.role === "individual") {
        await tx.application.updateMany({
          where: { pfcUserId: id, applicationStatus: "pending" },
          data: { applicationStatus: "rejected" },
        });
      }

      // 4. Purge et anonymisation stricte
      const updateData: Prisma.PfcUserUpdateInput = {
        deletedAt: now,
        email: anonymizedEmail,
        password: "ANONYMIZED_PURGED",
        phoneNumber: null,
        address: null,
      };

      if (user.individualProfile) {
        updateData.individualProfile = {
          update: {
            housingType: null,
            surface: null,
            haveGarden: null,
            haveAnimals: null,
            haveChildren: null,
            availableFamily: null,
            availableTime: null,
          },
        };
      }

      if (user.shelterProfile) {
        updateData.shelterProfile = {
          update: {
            // Unicité garantie par l'ID utilisateur (max 10 chiffres + 4 de 'DEL-')
            siret: `DEL-${id}`,
            shelterName: "COMPTE_SUPPRIME",
            description: null,
            logo: null,
          },
        };
      }

      return tx.pfcUser.update({
        where: { id },
        data: updateData,
        select: safeUserSelect,
      });
    });
  }

  async validateUser(email: string, plainPassword: string) {
    const user = await this.findByEmail(email);
    if (!user || user.deletedAt) return null;

    const isValid = await argon2.verify(user.password, plainPassword);
    if (!isValid) return null;

    const { password, ...safeUser } = user;
    return safeUser;
  }

  async getProfile(userId: number) {
    if (!userId || Number.isNaN(userId)) {
      throw new BadRequestException("ID utilisateur invalide");
    }
    return this.prisma.pfcUser.findUnique({
      where: { id: userId },
      select: {
        ...safeUserSelect,
        individualProfile: true,
        shelterProfile: true,
      },
    });
  }

  async updatePassword(userId: number, dto: UpdatePasswordDto) {
    const user = await this.prisma.pfcUser.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) throw new NotFoundException("Utilisateur introuvable");

    const isValid = await argon2.verify(user.password, dto.oldPassword);
    if (!isValid) throw new BadRequestException("Ancien mot de passe incorrect");

    const hashed = await argon2.hash(dto.newPassword);
    return await this.prisma.pfcUser.update({
      where: { id: userId },
      data: { password: hashed },
      select: safeUserSelect,
    });
  }

  async updateIndividualProfile(id: number, dto: UpdateUserWithIndividualProfileDto) {
    const user = await this.prisma.pfcUser.findUnique({
      where: { id },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException("Utilisateur introuvable");
    }

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
      select: { ...safeUserSelect, individualProfile: true },
    });
  }

  async updateShelterProfile(id: number, dto: UpdateUserWithShelterProfileDto) {
    const user = await this.prisma.pfcUser.findUnique({
      where: { id },
      include: { shelterProfile: true },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException("Utilisateur introuvable");
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
                siret: user.shelterProfile?.siret,
                shelterName: dto.shelterName ?? user.shelterProfile?.shelterName,
                description: dto.description ?? user.shelterProfile?.description ?? null,
                logo: dto.logo ?? user.shelterProfile?.logo ?? null,
              },
              create: {
                siret: "00000000000000",
                shelterName: dto.shelterName ?? "Nom inconnu",
                description: dto.description ?? null,
                logo: dto.logo ?? null,
              },
            },
          },
        },
        select: { ...safeUserSelect, shelterProfile: true },
      });
    } catch (err) {
      Logger.error("Erreur Prisma updateShelterProfile:", err);
      throw new InternalServerErrorException("Impossible de mettre à jour le profil refuge");
    }
  }
}
