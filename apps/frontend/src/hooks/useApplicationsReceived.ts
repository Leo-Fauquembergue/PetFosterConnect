import type { ApplicationReceivedResponse } from "@projet/shared-types";
import { useCallback } from "react";
import { applicationApi } from "../api/applicationApi";
import { useFetch } from "./useFetch";

export const useApplicationsReceived = () => {
  const fetcher = useCallback(
    (signal: AbortSignal) => applicationApi.getReceivedApplications(signal),
    []
  );

  const {
    data: applications,
    setData: setApplications,
    loading,
    error,
  } = useFetch<ApplicationReceivedResponse[]>(
    fetcher,
    "Erreur lors du chargement des demandes reçues.",
    []
  );

  return { applications, setApplications, loading, error };
};
