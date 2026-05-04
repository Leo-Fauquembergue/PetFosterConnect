import { renderHook, waitFor } from "@testing-library/react";
import axios from "axios";
import { toast } from "react-toastify";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFetch } from "./useFetch";

// Mocks
vi.mock("react-toastify", () => ({
  toast: { error: vi.fn() },
}));

vi.mock("axios", async () => {
  const actual = (await vi.importActual("axios")) as Record<string, unknown>;
  return {
    ...actual,
    default: {
      ...(actual.default as object),
      isCancel: vi.fn().mockReturnValue(false),
      isAxiosError: vi.fn().mockReturnValue(false),
    },
    isCancel: vi.fn().mockReturnValue(false),
    isAxiosError: vi.fn().mockReturnValue(false),
  };
});

describe("useFetch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(axios.isCancel).mockReturnValue(false);
  });

  it("doit initialiser avec les données par défaut et charger les données", async () => {
    const mockData = { id: 1, name: "Test" };
    const fetcher = vi.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() => useFetch(fetcher, "Erreur", null));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBe(null);
    });
  });

  it("doit gérer les erreurs et afficher un toast", async () => {
    const error = new Error("Fetch failed");
    const fetcher = vi.fn().mockRejectedValue(error);

    const { result } = renderHook(() => useFetch(fetcher, "Message personnalisé", null));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Message personnalisé");
      expect(toast.error).toHaveBeenCalledWith("Message personnalisé");
    });
  });

  it("ne doit pas mettre à jour le state si la requête est annulée", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("Canceled"));
    vi.mocked(axios.isCancel).mockReturnValue(true);

    const { result } = renderHook(() => useFetch(fetcher, "Erreur", null));

    await waitFor(() => {
      expect(fetcher).toHaveBeenCalled();
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(null);
    expect(toast.error).not.toHaveBeenCalled();
  });
});
