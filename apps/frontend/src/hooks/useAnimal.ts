import type { AnimalDetailResponse, ApplicationStatus } from "@projet/shared-types";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { animalApi } from "../api/animalApi";
import { extractErrorMessage } from "../api/api";
import { mapToUIAnimal, type UIAnimal } from "../api/mappers/animalMapper";

export const useAnimal = (id: string | undefined) => {
  const [animal, setAnimal] = useState<UIAnimal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [myApplicationStatus, setMyApplicationStatus] = useState<ApplicationStatus | null>(null);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    const fetchAnimal = async () => {
      try {
        setLoading(true);
        const data = (await animalApi.getAnimalById(
          Number(id),
          controller.signal
        )) as AnimalDetailResponse;

        const mappedAnimal = mapToUIAnimal(data as unknown as Parameters<typeof mapToUIAnimal>[0]);
        setAnimal(mappedAnimal);

        if (data.isBookmarked !== undefined) {
          setIsFavorite(data.isBookmarked);
        }

        if (data.myApplicationStatus !== undefined) {
          setMyApplicationStatus(data.myApplicationStatus);
        }

        if (mappedAnimal.photos && mappedAnimal.photos.length > 0) {
          setSelectedPhoto(mappedAnimal.photos[0]);
        }
        setError(null);
      } catch (err: unknown) {
        if (axios.isCancel(err)) {
          return;
        }
        const errorMessage = extractErrorMessage(
          err,
          "Impossible de charger les détails de l'animal."
        );
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimal();

    return () => {
      controller.abort();
    };
  }, [id]);

  return {
    animal,
    loading,
    error,
    isFavorite,
    setIsFavorite,
    selectedPhoto,
    setSelectedPhoto,
    myApplicationStatus,
    setMyApplicationStatus,
    setAnimal,
  };
};
