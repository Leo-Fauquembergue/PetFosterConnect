import type { ShelterDetailResponse, ShelterWithRelations } from "@projet/shared-types";

export interface UIShelter {
  id: number;
  name: string;
  logo: string;
  address: string;
  siret: string;
  description: string;
  raw: ShelterWithRelations | ShelterDetailResponse;
}

export const mapToUIShelter = (
  shelter: ShelterWithRelations | ShelterDetailResponse
): UIShelter => {
  // 🛡️ SÉCURITÉ : On extrait l'ID de manière sûre.
  // Dans notre schéma, pfcUserId est la clé primaire des profils (1-1 avec PfcUser).
  const id = shelter.pfcUserId;

  const name = shelter.shelterName || "Refuge inconnu";
  const logo = shelter.logo || "https://placehold.co/600x400?text=Refuge";

  // Handling address which is often in the user object
  const address = shelter.user?.address || "Localisation non renseignée";

  const siret = shelter.siret || "Non renseigné";
  const description = shelter.description || "";

  return {
    id,
    name,
    logo,
    address,
    siret,
    description,
    raw: shelter,
  };
};

export const mapSheltersToUI = (shelters: ShelterWithRelations[]): UIShelter[] => {
  return shelters.map(mapToUIShelter);
};
