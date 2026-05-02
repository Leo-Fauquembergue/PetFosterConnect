import type {
  UpdateUserWithIndividualProfileDto,
  UpdateUserWithShelterProfileDto,
  UserWithProfiles,
} from "@projet/shared-types";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../api/api";
import { userApi } from "../api/userApi";

export type ProfileFormData = Partial<
  UpdateUserWithIndividualProfileDto & UpdateUserWithShelterProfileDto
>;

export const useUserProfile = (userId: string | undefined) => {
  const [user, setUser] = useState<UserWithProfiles | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({});

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

        if (userData.role === "individual") {
          setFormData({
            email: userData.email ?? "",
            phoneNumber: userData.phoneNumber ?? "",
            address: userData.address ?? "",
            surface: userData.individualProfile?.surface ?? 0,
            housingType: userData.individualProfile?.housingType ?? "other",
            haveGarden: userData.individualProfile?.haveGarden ?? false,
            haveAnimals: userData.individualProfile?.haveAnimals ?? false,
            haveChildren: userData.individualProfile?.haveChildren ?? false,
            availableFamily: userData.individualProfile?.availableFamily ?? false,
            availableTime: userData.individualProfile?.availableTime ?? "",
          });
        } else if (userData.role === "shelter") {
          setFormData({
            email: userData.email ?? "",
            phoneNumber: userData.phoneNumber ?? "",
            address: userData.address ?? "",
            shelterName: userData.shelterProfile?.shelterName ?? "",
            siret: userData.shelterProfile?.siret ?? "",
            description: userData.shelterProfile?.description ?? "",
            logo: userData.shelterProfile?.logo ?? "",
          });
        }
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
