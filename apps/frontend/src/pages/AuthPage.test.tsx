import { render, screen, fireEvent, waitFor, type RenderResult } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import AuthPage from "./AuthPage";
import { AuthProvider } from "../auth/AuthContext";
import { authApi } from "../api/authApi";
import { UserRole } from "@projet/shared-types";

// Mock de l'API
vi.mock("../api/authApi", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    getMe: vi.fn().mockResolvedValue({ 
      id: 1, 
      email: "test@test.com", 
      role: "individual" 
    } as any),
  },
}));

// Mock de Toastify
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AuthPage - LoginForm", () => {
  const renderAuthPage = async (): Promise<RenderResult> => {
    const view = render(
      <MemoryRouter initialEntries={["/connexion"]}>
        <AuthProvider>
          <AuthPage />
        </AuthProvider>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument());
    return view;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("doit rendre le formulaire de connexion par défaut", async () => {
    await renderAuthPage();
    expect(screen.getByRole("heading", { name: "Connexion", level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Se connecter" })).toBeInTheDocument();
  });

  it("doit appeler l'API de connexion et afficher l'état de chargement lors d'un succès", async () => {
    vi.mocked(authApi.login).mockImplementationOnce(() => 
      new Promise((resolve) => setTimeout(() => resolve({
        access_token: "fake-jwt-token",
        user: { 
          id: 1, 
          email: "test@test.com", 
          role: UserRole.individual
        } as any, 
      }), 50))
    );

    await renderAuthPage();
    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "test@test.com" } });
    fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: "Password123!" } });
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Connexion en cours..." })).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: "test@test.com",
        password: "Password123!",
      });
    });
  });

  it("doit gérer les erreurs de l'API (ex: identifiants incorrects) et déverrouiller le bouton", async () => {
    vi.mocked(authApi.login).mockRejectedValueOnce({
      response: { status: 401, data: { message: "Unauthorized" } },
    });

    await renderAuthPage();
    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: "wrong@test.com" } });
    fireEvent.change(screen.getByLabelText("Mot de passe"), { target: { value: "WrongPass!" } });
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "Se connecter" })).toBeInTheDocument();
    });
  });
});