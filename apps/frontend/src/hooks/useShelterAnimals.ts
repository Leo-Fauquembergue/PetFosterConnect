import type { AnimalWithRelations } from "@projet/shared-types";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../api/api";
import { shelterApi } from "../api/shelterApi";

export const useShelterAnimals = (shelterId: string | undefined) => {
  const [animals, setAnimals] = useState<AnimalWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!shelterId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchAnimals = async () => {
      try {
        setLoading(true);
        const data = await shelterApi.getShelterAnimals(Number(shelterId), controller.signal);
        setAnimals(data);
        setError(false);
      } catch (err: unknown) {
        if (axios.isCancel(err)) {
          return;
        }
        setError(true);
        const errorMessage = extractErrorMessage(err, "Erreur de chargement des animaux.");
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();

    return () => {
      controller.abort();
    };
  }, [shelterId]);

  return { animals, setAnimals, loading, error };
};
