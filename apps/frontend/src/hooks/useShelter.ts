import { useCallback } from "react";
import { mapToUIShelter, type UIShelter } from "../api/mappers/shelterMapper";
import { shelterApi } from "../api/shelterApi";
import { useFetch } from "./useFetch";

export const useShelter = (id: string | undefined) => {
  const fetcher = useCallback(
    async (signal: AbortSignal) => {
      if (!id) return Promise.reject(new Error("ID requis"));
      const data = await shelterApi.getShelterById(Number(id), signal);
      return mapToUIShelter(data);
    },
    [id]
  );

  const {
    data: shelter,
    setData: setShelter,
    loading,
    error,
  } = useFetch<UIShelter | null>(fetcher, "Impossible de charger le refuge.", null);

  return { shelter, loading, error, setShelter };
};
