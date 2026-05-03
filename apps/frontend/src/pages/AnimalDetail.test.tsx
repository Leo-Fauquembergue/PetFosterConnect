import { UserRole } from "@projet/shared-types";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { toast } from "react-toastify";
import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { animalApi } from "../api/animalApi";
import { applicationApi } from "../api/applicationApi";
import AnimalDetail from "./AnimalDetail";

// Mocks des APIs
vi.mock("../api/animalApi", () => ({
  animalApi: { getAnimalById: vi.fn() },
}));

vi.mock("../api/applicationApi", () => ({
  applicationApi: { createApplication: vi.fn() },
}));

vi.mock("../api/bookmarkApi", () => ({
  bookmarkApi: { toggleBookmark: vi.fn() },
}));

// Mock de Toastify
vi.mock("react-toastify", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// Mock du contexte d'authentification pour forcer un utilisateur connecté ("individual")
vi.mock("../auth/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, email: "adoptant@test.com", role: UserRole.individual },
    isLoading: false,
  }),
}));

// Mocks préventifs pour l'export PDF (évite les crashs JSDOM liés au canvas)
vi.mock("html2canvas", () => ({ default: vi.fn() }));
vi.mock("jspdf", () => ({ default: vi.fn() }));
vi.mock("qrcode", () => ({ default: { toDataURL: vi.fn() } }));

describe("AnimalDetail - Formulaire de demande", () => {
  const mockAnimal = {
    id: 1,
    name: "Rex",
    species: { name: "Chien" },
    age: "2 ans",
    sex: "male",
    weight: 15,
    height: 40,
    description: "Un super chien très joueur",
    animalStatus: "available",
    photos: ["http://photo.com/rex.jpg"],
    shelter: {
      pfcUserId: 2,
      address: "123 rue des chiens",
      shelterProfile: { shelterName: "SPA Test" },
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={["/animaux/1"]}>
        <Routes>
          <Route path="/animaux/:id" element={<AnimalDetail />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it("doit remplir le formulaire et appeler la soumission d'adoption avec les bonnes données", async () => {
    (animalApi.getAnimalById as Mock).mockResolvedValueOnce(mockAnimal);
    (applicationApi.createApplication as Mock).mockResolvedValueOnce({});

    renderComponent();

    // Attendre que la page charge l'animal
    await waitFor(() => {
      expect(screen.getByText("Rex")).toBeInTheDocument();
    });

    // 1. Identifier et remplir le champ "Message d'adoption"
    const adoptInput = screen.getByLabelText(/Message d'adoption/i);
    fireEvent.change(adoptInput, { target: { value: "Je voudrais adopter Rex." } });

    // 2. Cliquer sur le bouton Adopter
    const submitButton = screen.getByRole("button", { name: "Adopter" });
    fireEvent.click(submitButton);

    // 3. Vérifier que l'API est appelée avec le bon payload et qu'un succès s'affiche
    await waitFor(() => {
      expect(applicationApi.createApplication).toHaveBeenCalledWith({
        animalId: 1,
        applicationType: "adoption",
        message: "Je voudrais adopter Rex.",
      });
      expect(toast.success).toHaveBeenCalledWith("Demande d'adoption envoyée !");
    });
  });

  it("doit afficher une erreur si la demande échoue (ex: erreur serveur)", async () => {
    (animalApi.getAnimalById as Mock).mockResolvedValueOnce(mockAnimal);

    // On simule un rejet de l'API avec le flag isAxiosError pour extractErrorMessage
    (applicationApi.createApplication as Mock).mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { message: "Erreur serveur" } },
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Rex")).toBeInTheDocument();
    });

    // On remplit le champ avec un message valide (min 20 caractères)
    const adoptInput = screen.getByLabelText(/Message d'adoption/i);
    fireEvent.change(adoptInput, {
      target: { value: "Ceci est un message de motivation de plus de 20 caractères." },
    });

    // On clique sur le bouton Adopter
    const submitButton = screen.getByRole("button", { name: "Adopter" });
    fireEvent.click(submitButton);

    // Vérifier que l'erreur du backend est bien interceptée et affichée dans un Toast
    await waitFor(() => {
      expect(applicationApi.createApplication).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith("Erreur serveur");
    });
  });
});
