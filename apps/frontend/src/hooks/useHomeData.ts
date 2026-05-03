import type { AnimalWithRelations, ShelterWithRelations } from "@projet/shared-types";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { animalApi } from "../api/animalApi";
import { extractErrorMessage } from "../api/api";
import { shelterApi } from "../api/shelterApi";

type DisplayAnimal = Pick<AnimalWithRelations, "id" | "name"> & {
  species: string;
  age: string;
  image: string;
  location: string;
};

type DisplayShelter = {
  id: ShelterWithRelations["pfcUserId"];
  name: ShelterWithRelations["shelterName"];
  image: string;
  location: string;
};

export const useHomeData = () => {
  const [animals, setAnimals] = useState<DisplayAnimal[]>([]);
  const [shelters, setShelters] = useState<DisplayShelter[]>([]);
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

        // MAPPING ANIMAUX
        const recentAnimals = animalsData.map((a) => {
          let imageUrl = "https://placehold.co/600x400?text=Pas+de+photo";
          if (Array.isArray(a.photos) && a.photos.length > 0) {
            imageUrl = a.photos[0] as string;
          } else if (typeof a.photos === "string") {
            imageUrl = a.photos;
          }

          const shelterName = a.shelter?.shelterProfile?.shelterName;
          const displayLocation =
            shelterName === "DELETED" ? "Ancien refuge" : shelterName || "Refuge partenaire";

          return {
            id: a.id,
            name: a.name,
            species: a.species?.name || "Espèce inconnue",
            age: a.age || "Âge non renseigné",
            image: imageUrl,
            location: displayLocation,
          };
        });
        setAnimals(recentAnimals);

        // MAPPING REFUGES
        const featuredShelters = sheltersData.map((s) => ({
          id: s.pfcUserId,
          name: s.shelterName,
          image: s.logo || "https://placehold.co/600x400?text=Refuge",
          location: s.user?.address || "Localisation non renseignée",
        }));
        setShelters(featuredShelters);
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
