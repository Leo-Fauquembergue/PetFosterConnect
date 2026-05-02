import type { ShelterWithRelations } from "@projet/shared-types";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../api/api";
import { shelterApi } from "../api/shelterApi";

export const useShelters = () => {
  const [shelters, setShelters] = useState<ShelterWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchShelters = async () => {
      try {
        setLoading(true);
        const data = await shelterApi.getAllShelters(controller.signal);
        setShelters(data);
        setError(false);
      } catch (err: unknown) {
        if (axios.isCancel(err)) {
          return;
        }
        setError(true);
        const errorMessage = extractErrorMessage(err, "Impossible de charger les refuges.");
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchShelters();

    return () => {
      controller.abort();
    };
  }, []);

  return { shelters, loading, error, setShelters };
};
