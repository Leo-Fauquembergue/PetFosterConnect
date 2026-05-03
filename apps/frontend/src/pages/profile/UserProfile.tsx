import { zodResolver } from "@hookform/resolvers/zod";
import {
  type UpdateUserWithIndividualProfileDto,
  UpdateUserWithIndividualProfileSchema,
  type UpdateUserWithShelterProfileDto,
  UpdateUserWithShelterProfileSchema,
  UserRole,
  type UserWithProfiles,
} from "@projet/shared-types";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
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

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();

  const { user, setUser, loading, formData } = useUserProfile(id);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm({
    resolver: zodResolver(
      user?.role === UserRole.individual
        ? UpdateUserWithIndividualProfileSchema
        : UpdateUserWithShelterProfileSchema
    ),
    defaultValues: formData,
  });

  const { reset, handleSubmit } = methods;

  // Mettre à jour les valeurs par défaut quand formData est chargé
  useEffect(() => {
    if (formData) {
      reset(formData);
    }
  }, [formData, reset]);

  if (loading) return <p>Chargement...</p>;
  if (!user) return <p>Utilisateur introuvable</p>;

  const onSubmit = async (
    data: UpdateUserWithIndividualProfileDto | UpdateUserWithShelterProfileDto
  ) => {
    setIsSubmitting(true);

    try {
      let updatedUser: UserWithProfiles;

      if (user.role === UserRole.individual) {
        updatedUser = (await userApi.updateIndividualProfile(
          user.id as number,
          data as UpdateUserWithIndividualProfileDto
        )) as UserWithProfiles;
      } else {
        updatedUser = (await userApi.updateShelterProfile(
          user.id as number,
          data as UpdateUserWithShelterProfileDto
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
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {user.role === UserRole.individual ? (
                <IndividualProfileForm />
              ) : (
                <ShelterProfileForm siret={user.shelterProfile?.siret} />
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
          </FormProvider>
        )}
      </div>
    </div>
  );
}
