import type { ApplicationSentResponse } from "@projet/shared-types";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../api/api";
import { applicationApi } from "../api/applicationApi";

export const useApplicationsSent = () => {
  const [applications, setApplications] = useState<ApplicationSentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await applicationApi.getSentApplications(controller.signal);
        setApplications(data);
        setError(false);
      } catch (err: unknown) {
        if (axios.isCancel(err)) {
          return;
        }
        setError(true);
        const errorMessage = extractErrorMessage(
          err,
          "Erreur lors du chargement de vos candidatures."
        );
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();

    return () => {
      controller.abort();
    };
  }, []);

  return { applications, setApplications, loading, error };
};
