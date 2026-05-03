import { useCallback } from "react";
import { animalApi } from "../api/animalApi";
import { mapAnimalsToUI, type UIAnimal } from "../api/mappers/animalMapper";
import { useFetch } from "./useFetch";

export const useAnimals = () => {
  const fetcher = useCallback(async (signal: AbortSignal) => {
    const data = await animalApi.getAllAnimals(signal);
    return mapAnimalsToUI(data);
  }, []);

  const {
    data: animals,
    loading,
    error,
  } = useFetch<UIAnimal[]>(fetcher, "Impossible de charger les animaux.", []);

  return { animals, loading, error };
};
