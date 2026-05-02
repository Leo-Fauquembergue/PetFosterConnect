import type {
  UpdateUserWithIndividualProfileDto,
  UpdateUserWithShelterProfileDto,
} from "@projet/shared-types";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../../api/api";
import { userApi } from "../../api/userApi";
import UserCard from "../../components/cards/UserCard";
import IndividualProfileForm from "../../components/profile/IndividualProfileForm";
import PasswordForm from "../../components/profile/PasswordForm";
import ShelterProfileForm from "../../components/profile/ShelterProfileForm";
import { type UserWithProfiles, useUserProfile } from "../../hooks/useUserProfile";

// ⚡ Types stricts attendus par les composants enfants
type ExpectedIndividualProps = Required<
  Omit<UpdateUserWithIndividualProfileDto, "availableTime">
> & {
  availableTime?: string;
};

type ExpectedShelterProps = Required<UpdateUserWithShelterProfileDto>;

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { user, setUser, loading, formData, setFormData } = useUserProfile(id);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) return <p>Chargement...</p>;
  if (!user) return <p>Utilisateur introuvable</p>;

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let updatedUser: UserWithProfiles;

      if (user.role === "individual") {
        updatedUser = (await userApi.updateIndividualProfile(
          user.id as number,
          formData as UpdateUserWithIndividualProfileDto
        )) as UserWithProfiles;
      } else {
        updatedUser = (await userApi.updateShelterProfile(
          user.id as number,
          formData as UpdateUserWithShelterProfileDto
        )) as UserWithProfiles;
      }

      setUser({ ...user, ...updatedUser });
      setIsEditing(false);
      toast.success("Profil mis à jour avec succès !");
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, "Impossible de mettre à jour le profil.");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
        {!isEditing ? (
          <>
            <UserCard user={user} />
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="mt-4 bg-primary text-white px-4 py-2 rounded"
            >
              Modifier
            </button>

            <div className="mt-6 border-t pt-4">
              <h2 className="text-lg font-semibold">Modifier le mot de passe</h2>
              <PasswordForm userId={user.id as number} />
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {user.role === "individual" ? (
              <IndividualProfileForm
                formData={formData as ExpectedIndividualProps}
                onChange={(field, value) => handleChange(field, value)}
              />
            ) : (
              <ShelterProfileForm
                formData={formData as ExpectedShelterProps}
                onChange={(field, value) => handleChange(field, value)}
              />
            )}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
