import type { AnimalWithRelations } from "@projet/shared-types";
import { useCallback } from "react";
import { animalApi } from "../api/animalApi";
import { useFetch } from "./useFetch";

export const useAnimals = () => {
  const fetcher = useCallback(
    (signal: AbortSignal) => animalApi.getAllAnimals(signal),
    []
  );

  const { data: animals, loading, error } = useFetch<AnimalWithRelations[]>(
    fetcher,
    "Impossible de charger les animaux.",
    []
  );

  return { animals, loading, error };
};
