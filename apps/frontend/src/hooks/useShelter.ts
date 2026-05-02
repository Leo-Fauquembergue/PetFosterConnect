import type { ShelterDetailResponse } from "@projet/shared-types";
import { useCallback } from "react";
import { shelterApi } from "../api/shelterApi";
import { useFetch } from "./useFetch";

export const useShelter = (id: string | undefined) => {
  const fetcher = useCallback(
    (signal: AbortSignal) => {
      if (!id) return Promise.reject(new Error("ID requis"));
      return shelterApi.getShelterById(Number(id), signal);
    },
    [id]
  );

  const {
    data: shelter,
    setData: setShelter,
    loading,
    error,
  } = useFetch<ShelterDetailResponse | null>(
    fetcher,
    "Impossible de charger le refuge.",
    null
  );

  return { shelter, loading, error: !!error, setShelter };
};
