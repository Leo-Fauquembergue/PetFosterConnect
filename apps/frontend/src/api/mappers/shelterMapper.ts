import type { ShelterDetailResponse, ShelterWithRelations } from "@projet/shared-types";

export interface UIShelter {
  id: number;
  name: string;
  logo: string;
  address: string;
  siret: string;
  description: string;
}

export const mapToUIShelter = (
  shelter: ShelterWithRelations | ShelterDetailResponse
): UIShelter => {
  return {
    id: shelter.pfcUserId,
    name: shelter.shelterName || "Refuge inconnu",
    logo: shelter.logo || "https://placehold.co/600x400?text=Refuge",
    address: shelter.user?.address || "Localisation non renseignée",
    siret: shelter.siret || "Non renseigné",
    description: shelter.description || "",
  };
};

export const mapSheltersToUI = (shelters: ShelterWithRelations[]): UIShelter[] => {
  return shelters.map(mapToUIShelter);
};
