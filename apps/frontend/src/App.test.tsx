import { UserRole } from "@projet/shared-types";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { authApi } from "./api/authApi";
import { AuthProvider } from "./auth/AuthContext";

// Mocks
vi.mock("./api/authApi", () => ({
  authApi: {
    getCsrfToken: vi.fn().mockResolvedValue("token"),
    getMe: vi.fn(),
  },
}));

describe("App - Routing & Security", () => {
  it("doit rediriger vers /connexion si l'utilisateur n'est pas authentifié sur une route protégée", async () => {
    vi.mocked(authApi.getMe).mockRejectedValueOnce(new Error("Unauthorized"));

    render(
      <MemoryRouter initialEntries={["/utilisateur/1/profil"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Heureux de vous revoir/i)).toBeInTheDocument();
    });
  });

  it("doit bloquer l'accès à /admin pour un utilisateur 'individual' (403)", async () => {
    vi.mocked(authApi.getMe).mockResolvedValueOnce({
      id: 1,
      role: UserRole.individual,
      email: "user@test.com",
    } as unknown as import("@projet/shared-types").UserWithProfiles);

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      // On s'attend à être redirigé vers /interdit (Forbidden page)
      expect(screen.getByText(/Accès interdit/i)).toBeInTheDocument();
    });
  });

  it("doit autoriser l'accès à /admin pour un administrateur", async () => {
    vi.mocked(authApi.getMe).mockResolvedValueOnce({
      id: 1,
      role: UserRole.admin,
      email: "admin@test.com",
    } as unknown as import("@projet/shared-types").UserWithProfiles);

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Tableau de Bord/i)).toBeInTheDocument();
    });
  });

  it("ne doit PAS rediriger vers /connexion si l'utilisateur est déconnecté sur une route publique", async () => {
    // getMe échoue (utilisateur non connecté)
    vi.mocked(authApi.getMe).mockRejectedValueOnce(new Error("Unauthorized"));

    render(
      <MemoryRouter initialEntries={["/animaux"]}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      // On vérifie qu'on est bien TOUJOURS sur la page des animaux
      expect(screen.getByText(/Nos animaux à adopter/i)).toBeInTheDocument();
      // Et qu'on n'est PAS sur la page de connexion
      expect(screen.queryByText(/Heureux de vous revoir/i)).not.toBeInTheDocument();
    });
  });
});
