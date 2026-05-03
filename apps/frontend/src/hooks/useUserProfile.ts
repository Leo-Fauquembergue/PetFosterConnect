import { type UserWithProfiles } from "@projet/shared-types";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../api/api";
import { mapToProfileFormData, type UIProfileFormData } from "../api/mappers/userMapper";
import { userApi } from "../api/userApi";

export const useUserProfile = (userId: string | undefined) => {
  const [user, setUser] = useState<UserWithProfiles | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [formData, setFormData] = useState<UIProfileFormData>({
    email: "",
    phoneNumber: "",
    address: "",
  });

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await userApi.getProfile(Number(userId), controller.signal);
        setUser(userData);

        // MAPPING DU FORMULAIRE (Utilisation du mapper centralisé)
        setFormData(mapToProfileFormData(userData));

        setError(false);
      } catch (err: unknown) {
        if (axios.isCancel(err)) {
          return;
        }
        setError(true);
        const errorMessage = extractErrorMessage(err, "Impossible de charger le profil.");
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    return () => {
      controller.abort();
    };
  }, [userId]);

  return { user, setUser, loading, error, formData, setFormData };
};
