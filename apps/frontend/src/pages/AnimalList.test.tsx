import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AnimalList from "./AnimalList";
import { animalApi } from "../api/animalApi";
import type { AnimalWithRelations } from "@projet/shared-types";

// Mock de l'API
vi.mock("../api/animalApi", () => ({
  animalApi: {
    getAllAnimals: vi.fn(),
  },
}));

// Mock de Toastify
vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("AnimalList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("doit afficher le loader au début, puis les cartes des animaux", async () => {
    // CORRECTION : Fidélité stricte des mocks. On remet createdAt exigé par AnimalSchema
    const mockAnimals: AnimalWithRelations[] = [
      {
        id: 1,
        name: "Rex",
        age: "2 ans",
        sex: "male",
        weight: 15,
        height: 50,
        description: "Un chien adorable",
        animalStatus: "available",
        acceptOtherAnimals: true,
        acceptChildren: true,
        needGarden: true,
        treatment: "Aucun",
        photos: ["http://photo.com/rex.jpg"],
        speciesId: 1,
        pfcUserId: 1,
        createdAt: new Date(), // <-- EXIGÉ PAR ZOD
        updatedAt: null,
        deletedAt: null,
        species: {
          id: 1,
          name: "Chien",
        },
        shelter: {
          id: 1,
          shelterProfile: {
            shelterName: "SPA Paris",
          },
        },
      },
      {
        id: 2,
        name: "Mimi",
        age: "1 an",
        sex: "female",
        weight: 4,
        height: 25,
        description: "Un chat joueur",
        animalStatus: "available",
        acceptOtherAnimals: false,
        acceptChildren: true,
        needGarden: false,
        treatment: null,
        photos: ["http://photo.com/mimi.jpg"],
        speciesId: 2,
        pfcUserId: 2,
        createdAt: new Date(), // <-- EXIGÉ PAR ZOD
        updatedAt: null,
        deletedAt: null,
        species: {
          id: 2,
          name: "Chat",
        },
        shelter: {
          id: 2,
          shelterProfile: {
            shelterName: "SPA Lyon",
          },
        },
      },
    ];

    vi.mocked(animalApi.getAllAnimals).mockResolvedValueOnce(mockAnimals);

    render(
      <MemoryRouter>
        <AnimalList />
      </MemoryRouter>
    );

    expect(screen.getByText(/Recherche de compagnons/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Rex")).toBeInTheDocument();
      expect(screen.getByText("Mimi")).toBeInTheDocument();
    });

    expect(screen.queryByText(/Recherche de compagnons/i)).not.toBeInTheDocument();
  });
});