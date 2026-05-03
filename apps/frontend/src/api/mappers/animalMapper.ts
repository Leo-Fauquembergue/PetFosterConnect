import type { AnimalWithRelations } from "@projet/shared-types";

export interface UIAnimal {
  id: number;
  name: string;
  age: string;
  sex: string;
  animalStatus: string;
  description: string;
  speciesName: string;
  mainPhoto: string;
  shelterName: string;
  displayLocation: string;
  shelterAddress: string;
  photos: string[];
  height: number;
  weight: number;
  acceptChildren: boolean;
  acceptOtherAnimals: boolean;
  needGarden: boolean;
  treatment: string;
  deletedAt: Date | null;
  species?: { name: string };
  shelter?: { id: number; shelterProfile?: { shelterName: string } };
}

export const mapToUIAnimal = (
  animal: AnimalWithRelations,
  context?: { shelterName?: string; shelterId?: number }
): UIAnimal => {
  const photos = Array.isArray(animal.photos) ? (animal.photos as string[]) : [];
  const mainPhoto =
    photos.length > 0 ? photos[0] : "https://placehold.co/600x400?text=Pas+de+photo";

  const rawShelterName = animal.shelter?.shelterProfile?.shelterName || context?.shelterName;
  const displayLocation =
    rawShelterName === "DELETED" ? "Ancien refuge" : rawShelterName || "Refuge partenaire";

  return {
    id: animal.id,
    name: animal.name,
    age: animal.age || "Non renseigné",
    sex: animal.sex || "unknown",
    animalStatus: animal.animalStatus || "unavailable",
    description: animal.description || "",
    speciesName:
      typeof animal.species === "string"
        ? animal.species
        : animal.species?.name || "Espèce inconnue",
    mainPhoto,
    shelterName: displayLocation,
    displayLocation,
    shelterAddress: animal.shelter?.address || "Non communiquée",
    photos: photos,
    height: animal.height || 0,
    weight: animal.weight || 0,
    acceptChildren: animal.acceptChildren ?? false,
    acceptOtherAnimals: animal.acceptOtherAnimals ?? false,
    needGarden: animal.needGarden ?? false,
    treatment: animal.treatment || "Aucun traitement particulier",
    deletedAt: animal.deletedAt ? new Date(animal.deletedAt) : null,
    species: animal.species
      ? { name: typeof animal.species === "string" ? animal.species : animal.species.name }
      : undefined,
    shelter: animal.shelter
      ? { id: animal.shelter.id, shelterProfile: animal.shelter.shelterProfile }
      : undefined,
  };
};

export const mapAnimalsToUI = (
  animals: AnimalWithRelations[],
  context?: { shelterName?: string; shelterId?: number }
): UIAnimal[] => {
  return animals.map((a) => mapToUIAnimal(a, context));
};
