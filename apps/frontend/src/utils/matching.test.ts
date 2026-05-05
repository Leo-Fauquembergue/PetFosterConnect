import type { Animal, IndividualProfile } from "@projet/shared-types";
import { describe, expect, it } from "vitest";
import { checkMatchingWarnings } from "./matching";

describe("checkMatchingWarnings", () => {
  const mockAnimal: Animal = {
    id: 1,
    name: "Médor",
    needGarden: true,
    acceptChildren: false,
    acceptOtherAnimals: false,
    speciesId: 1,
    pfcUserId: 1,
    animalStatus: "available",
    sex: "male",
    createdAt: new Date(),
  } as Animal;

  it("should return warning if profile is null", () => {
    const result = checkMatchingWarnings(mockAnimal, null);
    expect(result.shouldWarn).toBe(true);
    expect(result.warningMessages).toContain(
      "Votre profil est incomplet. Veuillez renseigner vos informations pour vérifier la compatibilité."
    );
  });

  it("should return conflicts when user data explicitly contradicts animal needs", () => {
    const profile: Partial<IndividualProfile> = {
      haveGarden: false,
      haveChildren: true,
      haveAnimals: true,
    };
    const result = checkMatchingWarnings(mockAnimal, profile);
    expect(result.shouldWarn).toBe(true);
    expect(result.warningMessages).toHaveLength(3);
    expect(result.warningMessages).toContain(
      "L'animal a besoin d'un jardin, ce que vous n'avez pas."
    );
    expect(result.warningMessages).toContain(
      "L'animal n'accepte pas les enfants, et vous en avez."
    );
    expect(result.warningMessages).toContain(
      "L'animal n'accepte pas les autres animaux, et vous en avez."
    );
  });

  it("should return missing info warnings when profile fields are null or undefined", () => {
    const profile: Partial<IndividualProfile> = {
      haveGarden: undefined,
      haveChildren: null as unknown as undefined,
      haveAnimals: undefined,
    };
    const result = checkMatchingWarnings(mockAnimal, profile);
    expect(result.shouldWarn).toBe(true);
    expect(result.warningMessages).toHaveLength(3);
    expect(result.warningMessages).toContain(
      "L'animal a besoin d'un jardin, ce qui n'est pas précisé dans votre profil."
    );
  });

  it("should return no warnings if everything matches perfectly", () => {
    const compatibleAnimal: Animal = {
      ...mockAnimal,
      needGarden: false,
      acceptChildren: true,
      acceptOtherAnimals: true,
    } as Animal;

    const profile: Partial<IndividualProfile> = {
      haveGarden: false, // Animal doesn't need it
      haveChildren: true, // Animal accepts them
      haveAnimals: true, // Animal accepts them
    };
    const result = checkMatchingWarnings(compatibleAnimal, profile);
    expect(result.shouldWarn).toBe(false);
    expect(result.warningMessages).toHaveLength(0);
  });

  it("should return no warnings if animal needs garden and user has it", () => {
    const profile: Partial<IndividualProfile> = {
      haveGarden: true,
      haveChildren: false,
      haveAnimals: false,
    };
    const result = checkMatchingWarnings(mockAnimal, profile);
    expect(result.shouldWarn).toBe(false);
  });
});
