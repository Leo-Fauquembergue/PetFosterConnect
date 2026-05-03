import { UserRole, type UserWithProfiles } from "@projet/shared-types";

export interface UIProfileFormData {
  email: string;
  phoneNumber: string;
  address: string;
  // Individual
  surface?: number;
  housingType?: string;
  haveGarden?: boolean;
  haveAnimals?: boolean;
  haveChildren?: boolean;
  availableFamily?: boolean;
  availableTime?: string;
  // Shelter
  shelterName?: string;
  description?: string;
  logo?: string;
}

export const mapToProfileFormData = (user: UserWithProfiles): UIProfileFormData => {
  const common = {
    email: user.email ?? "",
    phoneNumber: user.phoneNumber ?? "",
    address: user.address ?? "",
  };

  if (user.role === UserRole.individual) {
    return {
      ...common,
      surface: user.individualProfile?.surface ?? 0,
      housingType: user.individualProfile?.housingType ?? "other",
      haveGarden: user.individualProfile?.haveGarden ?? false,
      haveAnimals: user.individualProfile?.haveAnimals ?? false,
      haveChildren: user.individualProfile?.haveChildren ?? false,
      availableFamily: user.individualProfile?.availableFamily ?? false,
      availableTime: user.individualProfile?.availableTime ?? "",
    };
  }

  if (user.role === UserRole.shelter) {
    return {
      ...common,
      shelterName: user.shelterProfile?.shelterName ?? "",
      description: user.shelterProfile?.description ?? "",
      logo: user.shelterProfile?.logo ?? "",
    };
  }

  return common;
};
