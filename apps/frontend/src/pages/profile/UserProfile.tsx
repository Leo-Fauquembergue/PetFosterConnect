import {
  type UpdateUserWithIndividualProfileDto,
  type UpdateUserWithShelterProfileDto,
  UserRole,
  type UserWithProfiles,
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
import Button from "../../components/ui/Button";
import { useUserProfile } from "../../hooks/useUserProfile";

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

      if (user.role === UserRole.individual) {
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
            <Button variant="primary" onClick={() => setIsEditing(true)} className="mt-4">
              Modifier
            </Button>

            <div className="mt-6 border-t pt-4">
              <h2 className="text-lg font-semibold">Modifier le mot de passe</h2>
              <PasswordForm userId={user.id as number} />
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {user.role === UserRole.individual ? (
              <IndividualProfileForm
                formData={formData as ExpectedIndividualProps}
                onChange={(field, value) => handleChange(field, value)}
              />
            ) : (
              <ShelterProfileForm
                formData={formData as ExpectedShelterProps}
                onChange={(field, value) => handleChange(field, value)}
                siret={user.shelterProfile?.siret}
              />
            )}
            <div className="flex justify-between gap-4">
              <Button variant="neutral" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-grow">
                {isSubmitting ? "Sauvegarde..." : "Sauvegarder"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
