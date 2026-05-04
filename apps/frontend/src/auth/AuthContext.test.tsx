import { UserRole } from "@projet/shared-types";
import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { authApi } from "../api/authApi";
import { AuthProvider, useAuth } from "./AuthContext";

// Mocks
vi.mock("../api/authApi", () => ({
  authApi: {
    getCsrfToken: vi.fn().mockResolvedValue("token"),
    getMe: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Par défaut, l'utilisateur n'est pas connecté au montage
    vi.mocked(authApi.getMe).mockRejectedValue(new Error("Unauthorized"));
    vi.mocked(authApi.getCsrfToken).mockResolvedValue("token");
  });

  it("doit récupérer l'utilisateur au montage", async () => {
    const mockUser = {
      id: 1,
      email: "test@test.com",
      role: UserRole.individual,
    } as unknown as import("@projet/shared-types").UserWithProfiles;
    vi.mocked(authApi.getMe).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isLoggedIn).toBe(true);
    });
  });

  it("doit gérer l'échec de récupération de l'utilisateur", async () => {
    vi.mocked(authApi.getMe).mockRejectedValue(new Error("Unauthorized"));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.isLoggedIn).toBe(false);
    });
  });

  it("doit connecter l'utilisateur", async () => {
    const mockUser = {
      id: 1,
      email: "test@test.com",
      role: UserRole.individual,
    } as unknown as import("@projet/shared-types").UserWithProfiles;
    vi.mocked(authApi.login).mockResolvedValue({
      user: mockUser,
      access_token: "token",
      csrfToken: "token",
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Attendre que le chargement initial soit fini (échec getMe)
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.login({ email: "test@test.com", password: "password" });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoggedIn).toBe(true);
  });

  it("doit déconnecter l'utilisateur", async () => {
    const mockUser = {
      id: 1,
      email: "test@test.com",
      role: UserRole.individual,
    } as unknown as import("@projet/shared-types").UserWithProfiles;
    vi.mocked(authApi.getMe).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBe(null);
    expect(result.current.isLoggedIn).toBe(false);
    expect(authApi.logout).toHaveBeenCalled();
  });
});
