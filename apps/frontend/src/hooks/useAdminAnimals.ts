import { useCallback } from "react";
import { animalApi } from "../api/animalApi";
import { mapAnimalsToUI, type UIAnimal } from "../api/mappers/animalMapper";
import { useFetch } from "./useFetch";

export const useAdminAnimals = () => {
  const fetcher = useCallback(async (signal: AbortSignal) => {
    const data = await animalApi.getAllAdmin(signal);
    return mapAnimalsToUI(data);
  }, []);

  const {
    data: animals,
    loading,
    error,
    setData: setAnimals,
  } = useFetch<UIAnimal[]>(fetcher, "Impossible de charger la liste des animaux.", []);

  return { animals, loading, error, setAnimals };
};
