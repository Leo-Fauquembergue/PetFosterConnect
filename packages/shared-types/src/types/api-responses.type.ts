import type { AnimalWithRelations } from "../animal-with-relation.schema";
import type { ApplicationStatus, ApplicationType } from "../application.schema";
import type { IndividualProfile, ShelterProfile } from "../profile.schema";
import type { User } from "../user.schema";

// APPLICATIONS

export interface ApplicationSentResponse {
  pfcUserId: number;
  animalId: number;
  applicationType: ApplicationType;
  applicationStatus: ApplicationStatus;
  message: string | null;
  createdAt: Date | string;
  animal: AnimalWithRelations;
  user: {
    id: number;
    email: string;
    phoneNumber: string | null;
  };
}

export interface ApplicationReceivedResponse {
  pfcUserId: number;
  animalId: number;
  applicationType: ApplicationType;
  applicationStatus: ApplicationStatus;
  message: string | null;
  createdAt: Date | string;
  animal: {
    id: number;
    name: string;
    photos: unknown; // ⚡ Plus sûr que `any` pour interagir avec le type Json de Prisma
  };
  user: {
    id: number;
    email: string;
    phoneNumber: string | null;
    individualProfile: IndividualProfile | null;
  };
}

// SHELTERS

export type ShelterWithRelations = ShelterProfile & {
  user?: User;
};

export type ShelterDetailResponse = ShelterProfile & {
  user: User & {
    animals: AnimalWithRelations[];
  };
};

// UI COMPONENTS

export interface UserCardProps {
  user: User & {
    individualProfile?: IndividualProfile | null;
    shelterProfile?: ShelterProfile | null;
  };
  onAction?: () => void;
}
