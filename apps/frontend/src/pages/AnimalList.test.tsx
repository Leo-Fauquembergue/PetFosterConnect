import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AnimalList from "./AnimalList";
import { animalApi } from "../api/animalApi";

// Mock de l'API
vi.mock("../api/animalApi", () => ({
  animalApi: {
    getAllAnimals: vi.fn(),
  },
}));

// Mock de Toastify pour éviter les erreurs liées au DOM manquant
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

  it("doit afficher le loader au début, puis les cartes des animaux une fois les données chargées", async () => {
    // 1. Définition des fausses données
    const mockAnimals = [
      {
        id: 1,
        name: "Rex",
        species: { name: "Chien" },
        age: "2 ans",
        photos: ["http://photo.com/rex.jpg"],
        shelter: { shelterProfile: { shelterName: "SPA Paris" } },
      },
      {
        id: 2,
        name: "Mimi",
        species: { name: "Chat" },
        age: "1 an",
        photos: ["http://photo.com/mimi.jpg"],
        shelter: { shelterProfile: { shelterName: "SPA Lyon" } },
      },
    ];

    // 2. Simuler le délai de la promesse pour bien voir le loader
    (animalApi.getAllAnimals as any).mockResolvedValueOnce(mockAnimals);

    render(
      <MemoryRouter>
        <AnimalList />
      </MemoryRouter>
    );

    // 3. Vérifier que le loader est affiché immédiatement
    expect(screen.getByText(/Recherche de compagnons/i)).toBeInTheDocument();

    // 4. Attendre le chargement complet et vérifier que les animaux s'affichent
    await waitFor(() => {
      expect(screen.getByText("Rex")).toBeInTheDocument();
      expect(screen.getByText("Mimi")).toBeInTheDocument();
    });

    // 5. Vérifier que le loader a bien disparu
    expect(screen.queryByText(/Recherche de compagnons/i)).not.toBeInTheDocument();
  });
});