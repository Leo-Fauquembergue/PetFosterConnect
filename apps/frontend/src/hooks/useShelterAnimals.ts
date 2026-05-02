import type { AnimalWithRelations } from "@projet/shared-types";
import { useCallback } from "react";
import { shelterApi } from "../api/shelterApi";
import { useFetch } from "./useFetch";

export const useShelterAnimals = (shelterId: string | undefined) => {
  const fetcher = useCallback(
    (signal: AbortSignal) => {
      if (!shelterId) return Promise.reject(new Error("ID requis"));
      return shelterApi.getShelterAnimals(Number(shelterId), signal);
    },
    [shelterId]
  );

  const {
    data: animals,
    setData: setAnimals,
    loading,
    error,
  } = useFetch<AnimalWithRelations[]>(fetcher, "Erreur de chargement des animaux.", []);

  return { animals, setAnimals, loading, error };
};
