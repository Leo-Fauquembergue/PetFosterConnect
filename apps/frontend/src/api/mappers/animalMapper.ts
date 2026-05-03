import type { AnimalWithRelations } from "@projet/shared-types";

export interface UIAnimal extends AnimalWithRelations {
  speciesName: string;
  mainPhoto: string;
  shelterName: string;
  displayLocation: string; // Alias for shelterName or similar
  raw: AnimalWithRelations;
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
    ...animal,
    speciesName:
      typeof animal.species === "string"
        ? animal.species
        : animal.species?.name || "Espèce inconnue",
    mainPhoto,
    shelterName: displayLocation,
    displayLocation,
    raw: animal,
  };
};

export const mapAnimalsToUI = (
  animals: AnimalWithRelations[],
  context?: { shelterName?: string; shelterId?: number }
): UIAnimal[] => {
  return animals.map((a) => mapToUIAnimal(a, context));
};
