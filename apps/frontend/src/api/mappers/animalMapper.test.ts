import type { AnimalWithRelations } from "@projet/shared-types";
import { describe, expect, it } from "vitest";
import { mapToUIAnimal } from "./animalMapper";

describe("animalMapper", () => {
  describe("mapToUIAnimal", () => {
    it("doit mapper correctement avec les valeurs par défaut si les données sont minimales", () => {
      const minimalAnimal = {
        id: 1,
        name: "Inconnu",
        speciesId: 1,
        pfcUserId: 1,
        createdAt: new Date(),
        updatedAt: null,
        deletedAt: null,
      } as AnimalWithRelations;

      const result = mapToUIAnimal(minimalAnimal);

      expect(result.id).toBe(1);
      expect(result.name).toBe("Inconnu");
      expect(result.age).toBe("Non renseigné");
      expect(result.mainPhoto).toBe("https://placehold.co/600x400?text=Pas+de+photo");
      expect(result.shelterName).toBe("Refuge partenaire");
    });

    it("doit formater correctement l'affichage pour un ancien refuge (DELETED)", () => {
      const deletedShelterAnimal = {
        id: 2,
        name: "Rex",
        shelter: {
          id: 5,
          shelterProfile: {
            shelterName: "DELETED",
          },
        },
      } as unknown as AnimalWithRelations;

      const result = mapToUIAnimal(deletedShelterAnimal);

      expect(result.shelterName).toBe("Ancien refuge");
      expect(result.displayLocation).toBe("Ancien refuge");
    });

    it("doit utiliser la première photo fournie comme mainPhoto", () => {
      const animalWithPhotos = {
        id: 3,
        name: "Mimi",
        photos: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
      } as AnimalWithRelations;

      const result = mapToUIAnimal(animalWithPhotos);

      expect(result.mainPhoto).toBe("https://example.com/photo1.jpg");
      expect(result.photos).toHaveLength(2);
    });
  });
});
