    import { CreateAnimalSchema } from "@projet/shared-types";
import { describe, expect, it } from "vitest";

describe("Animal Form Logic - CreateAnimalSchema Validation", () => {
  it("should validate correctly with valid data from the form", () => {
    const validFormData = {
      name: "Rex",
      age: "3 ans",
      description: "Un chien très gentil",
      sex: "male",
      weight: 15,
      height: 45,
      animalStatus: "available",
      photos: ["https://example.com/photo.jpg"],
      acceptOtherAnimals: true,
      acceptChildren: true,
      needGarden: true,
      treatment: "Aucun",
      speciesId: 1,
    };

    const result = CreateAnimalSchema.safeParse(validFormData);
    expect(result.success).toBe(true);
  });

  it("should fail validation if name is missing", () => {
    const invalidData = {
      // name missing
      age: "3 ans",
      sex: "male",
      animalStatus: "available",
      speciesId: 1,
    };

    const result = CreateAnimalSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should fail validation if speciesId is missing", () => {
    const invalidData = {
      name: "Rex",
      age: "3 ans",
      sex: "male",
      animalStatus: "available",
      // speciesId missing
    };

    const result = CreateAnimalSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should handle default values correctly", () => {
    const minimalData = {
      name: "Rex",
      sex: "male",
      speciesId: 1,
    };

    const result = CreateAnimalSchema.safeParse(minimalData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.animalStatus).toBe("available");
      expect(result.data.photos).toEqual([]);
      expect(result.data.acceptOtherAnimals).toBe(false);
    }
  });

  it("should validate URLs in photos", () => {
    const dataWithInvalidUrl = {
      name: "Rex",
      sex: "male",
      speciesId: 1,
      photos: ["not-a-url"],
    };

    const result = CreateAnimalSchema.safeParse(dataWithInvalidUrl);
    expect(result.success).toBe(false);
  });
});
