import { UserRole } from "@projet/shared-types";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import { authApi } from "./api/authApi";

// Mocks
vi.mock("./api/authApi", () => ({
  authApi: {
    getCsrfToken: vi.fn().mockResolvedValue("token"),
    getMe: vi.fn(),
  },
}));

describe("App - Routing & Security", () => {
  it("doit rediriger vers /connexion si l'utilisateur n'est pas authentifié sur une route protégée", async () => {
    (authApi.getMe as any).mockRejectedValueOnce(new Error("Unauthorized"));

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
    (authApi.getMe as any).mockResolvedValueOnce({
      id: 1,
      role: UserRole.individual,
      email: "user@test.com",
    });

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
    (authApi.getMe as any).mockResolvedValueOnce({
      id: 1,
      role: UserRole.admin,
      email: "admin@test.com",
    });

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
});
