import type { ShelterDetailResponse, ShelterWithRelations } from "@projet/shared-types";
import { describe, expect, it } from "vitest";
import { mapToUIShelter } from "./shelterMapper";

describe("shelterMapper", () => {
  describe("mapToUIShelter", () => {
    it("doit mapper correctement un objet ShelterWithRelations", () => {
      const shelter = {
        pfcUserId: 1,
        shelterName: "SPA Paris",
        logo: "http://logo.com/spa.png",
        siret: "123456789",
        description: "Refuge de Paris",
        user: {
          address: "1 Rue de la SPA",
        },
      } as unknown as ShelterWithRelations;

      const result = mapToUIShelter(shelter);

      expect(result.id).toBe(1);
      expect(result.name).toBe("SPA Paris");
      expect(result.logo).toBe("http://logo.com/spa.png");
      expect(result.address).toBe("1 Rue de la SPA");
      expect(result.siret).toBe("123456789");
      expect(result.description).toBe("Refuge de Paris");
    });

    it("doit fournir des valeurs par défaut si les données sont manquantes", () => {
      const minimalShelter = {
        pfcUserId: 2,
      } as unknown as ShelterDetailResponse;

      const result = mapToUIShelter(minimalShelter);

      expect(result.name).toBe("Refuge inconnu");
      expect(result.logo).toBe("https://placehold.co/600x400?text=Refuge");
      expect(result.address).toBe("Localisation non renseignée");
      expect(result.siret).toBe("Non renseigné");
    });
  });
});
