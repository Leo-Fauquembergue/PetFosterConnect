import { useCallback } from "react";
import { mapAnimalsToUI, type UIAnimal } from "../api/mappers/animalMapper";
import { shelterApi } from "../api/shelterApi";
import { useFetch } from "./useFetch";

export const useShelterAnimals = (shelterId: string | undefined) => {
  const fetcher = useCallback(
    async (signal: AbortSignal) => {
      if (!shelterId) return Promise.reject(new Error("ID requis"));
      const data = await shelterApi.getShelterAnimals(Number(shelterId), signal);
      return mapAnimalsToUI(data);
    },
    [shelterId]
  );

  const {
    data: animals,
    setData: setAnimals,
    loading,
    error,
  } = useFetch<UIAnimal[]>(fetcher, "Erreur de chargement des animaux.", []);

  return { animals, setAnimals, loading, error };
};
