import type { ApplicationSentResponse } from "@projet/shared-types";
import { useCallback } from "react";
import { applicationApi } from "../api/applicationApi";
import { useFetch } from "./useFetch";

export const useApplicationsSent = () => {
  const fetcher = useCallback(
    (signal: AbortSignal) => applicationApi.getSentApplications(signal),
    []
  );

  const {
    data: applications,
    setData: setApplications,
    loading,
    error,
  } = useFetch<ApplicationSentResponse[]>(
    fetcher,
    "Erreur lors du chargement de vos candidatures.",
    []
  );

  return { applications, setApplications, loading, error };
};
