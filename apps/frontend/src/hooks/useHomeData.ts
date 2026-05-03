import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { animalApi } from "../api/animalApi";
import { extractErrorMessage } from "../api/api";
import { mapAnimalsToUI, type UIAnimal } from "../api/mappers/animalMapper";
import { mapSheltersToUI, type UIShelter } from "../api/mappers/shelterMapper";
import { shelterApi } from "../api/shelterApi";

export const useHomeData = () => {
  const [animals, setAnimals] = useState<UIAnimal[]>([]);
  const [shelters, setShelters] = useState<UIShelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        const [animalsData, sheltersData] = await Promise.all([
          animalApi.getLatestAnimals(controller.signal),
          shelterApi.getFeaturedShelters(controller.signal),
        ]);

        // MAPPING ANIMAUX (Utilisation du mapper centralisé)
        setAnimals(mapAnimalsToUI(animalsData));

        // MAPPING REFUGES (Utilisation du mapper centralisé)
        setShelters(mapSheltersToUI(sheltersData));
        setError(false);
      } catch (err: unknown) {
        if (axios.isCancel(err)) {
          return;
        }
        setError(true);
        const errorMessage = extractErrorMessage(
          err,
          "Impossible de charger les dernières annonces."
        );
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, []);

  return { animals, shelters, loading, error };
};
