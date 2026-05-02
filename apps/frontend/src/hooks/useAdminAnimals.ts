import type { AnimalWithRelations } from "@projet/shared-types";
import { useCallback } from "react";
import { animalApi } from "../api/animalApi";
import { useFetch } from "./useFetch";

export const useAdminAnimals = () => {
  const fetcher = useCallback(
    (signal: AbortSignal) => animalApi.getAllAdmin(signal),
    []
  );

  const {
    data: animals,
    loading,
    error,
    setData: setAnimals,
  } = useFetch<AnimalWithRelations[]>(
    fetcher,
    "Impossible de charger la liste des animaux.",
    []
  );

  return { animals, loading, error, setAnimals };
};
