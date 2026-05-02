import type { ShelterWithRelations } from "@projet/shared-types";
import { useCallback } from "react";
import { shelterApi } from "../api/shelterApi";
import { useFetch } from "./useFetch";

export const useShelters = () => {
  const fetcher = useCallback((signal: AbortSignal) => shelterApi.getAllShelters(signal), []);

  const {
    data: shelters,
    setData: setShelters,
    loading,
    error,
  } = useFetch<ShelterWithRelations[]>(fetcher, "Impossible de charger les refuges.", []);

  return { shelters, loading, error, setShelters };
};
