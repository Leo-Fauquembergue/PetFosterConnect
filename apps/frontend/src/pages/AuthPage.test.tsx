import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AuthPage from "./AuthPage";
import { AuthProvider } from "../auth/AuthContext";
import { authApi } from "../api/authApi";

// Mock de l'API : On empêche les vraies requêtes de partir vers le backend
vi.mock("../api/authApi", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn().mockResolvedValue({ id: 1, email: "test@test.com", role: "individual" }),
  },
}));

// Mock de Toastify pour éviter les alertes contextuelles instables dans JSDom
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AuthPage - LoginForm", () => {
  const renderAuthPage = () => {
    return render(
      <MemoryRouter initialEntries={["/connexion"]}>
        <AuthProvider>
          <AuthPage />
        </AuthProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("doit rendre le formulaire de connexion par défaut", () => {
    renderAuthPage();
    
    expect(screen.getByRole("heading", { name: "Connexion", level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mot de passe/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Se connecter" })).toBeInTheDocument();
  });

  it("doit afficher des erreurs de validation (Zod) si on soumet un formulaire vide", async () => {
    renderAuthPage();
    
    const submitButton = screen.getByRole("button", { name: "Se connecter" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Email invalide/i)).toBeInTheDocument();
      expect(screen.getByText(/Mot de passe requis/i)).toBeInTheDocument();
    });

    expect(authApi.login).not.toHaveBeenCalled();
  });

  it("doit appeler l'API de connexion et afficher l'état de chargement lors d'un succès", async () => {
    // On simule une réponse 200 du backend
    (authApi.login as any).mockResolvedValueOnce({
      access_token: "fake-jwt-token",
      user: { id: 1, email: "test@test.com", role: "individual" },
    });

    renderAuthPage();
    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@test.com" } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: "Password123!" } });
    
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    // Test de l'interface Bunkerisée (le bouton se désactive)
    expect(screen.getByRole("button", { name: "Connexion en cours..." })).toBeInTheDocument();

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "Password123!",
      });
    });
  });

  it("doit gérer les erreurs de l'API (ex: identifiants incorrects) et déverrouiller le bouton", async () => {
    // On simule une erreur 401 du backend
    (authApi.login as any).mockRejectedValueOnce({
      response: { status: 401, data: { message: "Unauthorized" } },
    });

    renderAuthPage();
    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "wrong@test.com" } });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), { target: { value: "WrongPass!" } });
    
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalled();
      // On s'assure que le Catch/Finally désactive le loading et remet le texte d'origine
      expect(screen.getByRole("button", { name: "Se connecter" })).toBeInTheDocument();
    });
  });
});