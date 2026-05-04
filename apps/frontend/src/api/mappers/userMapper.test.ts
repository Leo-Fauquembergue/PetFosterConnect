import { UserRole, type UserWithProfiles } from "@projet/shared-types";
import { describe, expect, it } from "vitest";
import { mapToProfileFormData } from "./userMapper";

describe("userMapper", () => {
  describe("mapToProfileFormData", () => {
    it("doit mapper les informations communes pour n'importe quel rôle", () => {
      const user = {
        id: 1,
        email: "test@test.com",
        phoneNumber: "0600000000",
        address: "123 Rue de la Paix",
        role: "unknown",
      } as unknown as UserWithProfiles;

      const result = mapToProfileFormData(user);

      expect(result.email).toBe("test@test.com");
      expect(result.phoneNumber).toBe("0600000000");
      expect(result.address).toBe("123 Rue de la Paix");
    });

    it("doit inclure les champs spécifiques au profil particulier", () => {
      const user = {
        id: 1,
        role: UserRole.individual,
        individualProfile: {
          surface: 50,
          housingType: "apartment",
          haveGarden: false,
          haveAnimals: true,
          haveChildren: false,
          availableFamily: true,
          availableTime: "Week-ends",
        },
      } as unknown as UserWithProfiles;

      const result = mapToProfileFormData(user);

      expect(result.surface).toBe(50);
      expect(result.housingType).toBe("apartment");
      expect(result.haveGarden).toBe(false);
      expect(result.haveAnimals).toBe(true);
      expect(result.availableFamily).toBe(true);
      expect(result.availableTime).toBe("Week-ends");
    });

    it("doit inclure les champs spécifiques au profil refuge", () => {
      const user = {
        id: 2,
        role: UserRole.shelter,
        shelterProfile: {
          shelterName: "Refuge de l'Espoir",
          description: "Un super refuge",
          logo: "http://logo.com",
        },
      } as unknown as UserWithProfiles;

      const result = mapToProfileFormData(user);

      expect(result.shelterName).toBe("Refuge de l'Espoir");
      expect(result.description).toBe("Un super refuge");
      expect(result.logo).toBe("http://logo.com");
    });

    it("doit retourner des valeurs par défaut si les profils sont absents", () => {
      const user = {
        id: 3,
        role: UserRole.individual,
        individualProfile: null,
      } as unknown as UserWithProfiles;

      const result = mapToProfileFormData(user);

      expect(result.surface).toBe(0);
      expect(result.housingType).toBe("other");
      expect(result.haveGarden).toBe(false);
    });
  });
});
