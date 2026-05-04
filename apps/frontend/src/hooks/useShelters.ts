import { useCallback } from "react";
import { mapSheltersToUI, type UIShelter } from "../api/mappers/shelterMapper";
import { shelterApi } from "../api/shelterApi";
import { useFetch } from "./useFetch";

export const useShelters = () => {
  const fetcher = useCallback(async (signal: AbortSignal) => {
    const data = await shelterApi.getAllShelters(signal);
    return mapSheltersToUI(data);
  }, []);

  const {
    data: shelters,
    setData: setShelters,
    loading,
    error,
  } = useFetch<UIShelter[]>(fetcher, "Impossible de charger les refuges.", []);

  return { shelters, loading, error, setShelters };
};
