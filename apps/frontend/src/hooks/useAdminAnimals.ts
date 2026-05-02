import type { AnimalWithRelations } from "@projet/shared-types";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { animalApi } from "../api/animalApi";
import { extractErrorMessage } from "../api/api";

export const useAdminAnimals = () => {
  const [animals, setAnimals] = useState<AnimalWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchAnimals = async () => {
      try {
        setLoading(true);
        const data = await animalApi.getAllAdmin(controller.signal);
        setAnimals(data as AnimalWithRelations[]);
        setError(false);
      } catch (err: unknown) {
        if (axios.isCancel(err)) {
          return;
        }
        setError(true);
        const errorMessage = extractErrorMessage(
          err,
          "Impossible de charger la liste des animaux."
        );
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

  return { animals, loading, error, setAnimals };
};
