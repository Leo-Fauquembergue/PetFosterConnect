import type { ShelterDetailResponse } from "@projet/shared-types";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../api/api";
import { shelterApi } from "../api/shelterApi";

export const useShelter = (id: string | undefined) => {
  const [shelter, setShelter] = useState<ShelterDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const fetchShelter = async () => {
      try {
        setLoading(true);
        const data = await shelterApi.getShelterById(Number(id), controller.signal);
        setShelter(data);
        setError(false);
      } catch (err: unknown) {
        if (axios.isCancel(err)) {
          return;
        }
        setError(true);
        const errorMessage = extractErrorMessage(err, "Impossible de charger le refuge.");
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchShelter();

    return () => {
      controller.abort();
    };
  }, [id]);

  return { shelter, loading, error, setShelter };
};
