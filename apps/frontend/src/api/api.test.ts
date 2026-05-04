import type { AxiosAdapter } from "axios";
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import api, { extractErrorMessage } from "./api";

describe("extractErrorMessage", () => {
  it("retourne le message par défaut si l'erreur n'est pas une erreur Axios", () => {
    expect(extractErrorMessage(new Error("Standard error"), "Default")).toBe("Default");
    expect(extractErrorMessage(null, "Default")).toBe("Default");
  });

  it("extrait un message string simple", () => {
    const error = {
      isAxiosError: true,
      response: { data: { message: "Server error message" } },
    };
    expect(extractErrorMessage(error, "Default")).toBe("Server error message");
  });

  it("extrait le premier message d'un ZodError stringifié", () => {
    const zodError = JSON.stringify([{ message: "Zod validation failed" }]);
    const error = {
      isAxiosError: true,
      response: { data: { message: { errors: { message: zodError } } } },
    };
    expect(extractErrorMessage(error, "Default")).toBe("Zod validation failed");
  });

  it("extrait la propriété 'error' si 'message' n'est pas présent", () => {
    const error = {
      isAxiosError: true,
      response: { data: { error: "Fallback error property" } },
    };
    expect(extractErrorMessage(error, "Default")).toBe("Fallback error property");
  });
});

describe("Axios Interceptors - Sécurité", () => {
  let mockAdapter: Mock;

  beforeEach(() => {
    vi.spyOn(window, "dispatchEvent");
    // Intercepter l'adaptateur pour empêcher les appels réseau
    mockAdapter = vi.fn();
    api.defaults.adapter = mockAdapter as unknown as AxiosAdapter;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("doit émettre 'auth:forbidden' lors d'une erreur 403", async () => {
    const originalPath = window.location.pathname;
    Object.defineProperty(window, "location", { value: { pathname: "/animaux" }, writable: true });

    const error403 = {
      isAxiosError: true,
      config: { url: "/test-route" },
      response: { status: 403 },
    };

    mockAdapter.mockRejectedValueOnce(error403);

    await expect(api.get("/test-route")).rejects.toEqual(error403);

    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "auth:forbidden" })
    );

    Object.defineProperty(window, "location", {
      value: { pathname: originalPath },
      writable: true,
    });
  });

  it("doit émettre 'auth:unauthorized' si le rafraîchissement échoue", async () => {
    const originalPath = window.location.pathname;
    Object.defineProperty(window, "location", { value: { pathname: "/animaux" }, writable: true });

    const error401 = {
      isAxiosError: true,
      config: { url: "/test-route" },
      response: { status: 401 },
    };

    const refreshError = {
      isAxiosError: true,
      config: { url: "/auth/refresh" },
      response: { status: 401 },
    };

    mockAdapter.mockRejectedValueOnce(error401).mockRejectedValueOnce(refreshError);

    await expect(api.get("/test-route")).rejects.toEqual(refreshError);

    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "auth:unauthorized" })
    );

    Object.defineProperty(window, "location", {
      value: { pathname: originalPath },
      writable: true,
    });
  });

  it("ne doit PAS émettre 'auth:unauthorized' si la route /auth/me échoue en 401", async () => {
    const error401Me = {
      isAxiosError: true,
      config: { url: "/auth/me" },
      response: { status: 401 },
    };

    mockAdapter.mockRejectedValueOnce(error401Me);

    await expect(api.get("/auth/me")).rejects.toEqual(error401Me);

    expect(window.dispatchEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: "auth:unauthorized" })
    );
  });
});
