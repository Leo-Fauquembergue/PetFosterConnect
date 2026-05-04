import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import api from "./api";

describe("Axios Interceptors - Sécurité", () => {
  beforeEach(() => {
    vi.spyOn(window, "dispatchEvent");
    // Intercepter l'adaptateur pour empêcher les appels réseau
    api.defaults.adapter = vi.fn();
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (api.defaults.adapter as any).mockRejectedValueOnce(error403);

    await expect(api.get("/test-route")).rejects.toEqual(error403);

    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "auth:forbidden" })
    );

    Object.defineProperty(window, "location", { value: { pathname: originalPath }, writable: true });
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (api.defaults.adapter as any)
      .mockRejectedValueOnce(error401)
      .mockRejectedValueOnce(refreshError);

    await expect(api.get("/test-route")).rejects.toEqual(refreshError);

    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "auth:unauthorized" })
    );

    Object.defineProperty(window, "location", { value: { pathname: originalPath }, writable: true });
  });
});
