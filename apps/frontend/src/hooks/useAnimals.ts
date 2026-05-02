import type { AnimalWithRelations } from "@projet/shared-types";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { animalApi } from "../api/animalApi";
import { extractErrorMessage } from "../api/api";

export const useAnimals = () => {
  const [animals, setAnimals] = useState<AnimalWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchAnimals = async () => {
      try {
        setLoading(true);
        const data = await animalApi.getAllAnimals(controller.signal);
        setAnimals(data);
        setError(false);
      } catch (err: unknown) {
        if (axios.isCancel(err)) {
          return;
        }
        setError(true);
        const errorMessage = extractErrorMessage(err, "Impossible de charger les animaux.");
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimals();

    return () => {
      controller.abort();
    };
  }, []);

  return { animals, loading, error };
};
