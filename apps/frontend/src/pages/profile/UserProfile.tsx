import { zodResolver } from "@hookform/resolvers/zod";
import {
  type UpdateUserDto,
  UpdateUserSchema,
  type UpdateUserWithIndividualProfileDto,
  UpdateUserWithIndividualProfileSchema,
  type UpdateUserWithShelterProfileDto,
  UpdateUserWithShelterProfileSchema,
  UserRole,
  type UserWithProfiles,
} from "@projet/shared-types";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../../api/api";
import { userApi } from "../../api/userApi";
import { useAuth } from "../../auth/AuthContext";
import UserCard from "../../components/cards/UserCard";
import AdminProfileForm from "../../components/profile/AdminProfileForm";
import IndividualProfileForm from "../../components/profile/IndividualProfileForm";
import PasswordForm from "../../components/profile/PasswordForm";
import ShelterProfileForm from "../../components/profile/ShelterProfileForm";
import Button from "../../components/ui/Button";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import { useUserProfile } from "../../hooks/useUserProfile";

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: authUser, setUser: setAuthUser, logout } = useAuth();

  const { user, setUser, loading, formData } = useUserProfile(id);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isOwnProfile = authUser && Number(authUser.id) === Number(id);
  const isAdmin = authUser?.role === UserRole.admin;
  const canEdit = isOwnProfile || isAdmin;

  const getResolver = () => {
    if (user?.role === UserRole.individual) return UpdateUserWithIndividualProfileSchema;
    if (user?.role === UserRole.shelter) return UpdateUserWithShelterProfileSchema;
    return UpdateUserSchema;
  };

  const methods = useForm({
    resolver: zodResolver(getResolver()),
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
    data: UpdateUserWithIndividualProfileDto | UpdateUserWithShelterProfileDto | UpdateUserDto
  ) => {
    setIsSubmitting(true);

    try {
      let updatedUser: UserWithProfiles;

      if (user.role === UserRole.individual) {
        updatedUser = (await userApi.updateIndividualProfile(
          user.id as number,
          data as UpdateUserWithIndividualProfileDto
        )) as UserWithProfiles;
      } else if (user.role === UserRole.shelter) {
        updatedUser = (await userApi.updateShelterProfile(
          user.id as number,
          data as UpdateUserWithShelterProfileDto
        )) as UserWithProfiles;
      } else {
        // Pour Admin, on utilise une mise à jour utilisateur simple (email, tel, adresse)
        updatedUser = (await userApi.updateIndividualProfile(
          user.id as number,
          data as UpdateUserWithIndividualProfileDto
        )) as UserWithProfiles;
      }

      // ⚡ SYNC : Mise à jour de l'état local
      setUser({ ...user, ...updatedUser });

      // ⚡ SYNC : Mise à jour de l'état global si c'est le profil de l'utilisateur connecté
      if (authUser && Number(authUser.id) === Number(user.id)) {
        setAuthUser({ ...authUser, ...updatedUser });
      }

      setIsEditing(false);
      toast.success("Profil mis à jour avec succès !");
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, "Impossible de mettre à jour le profil.");
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      await userApi.deleteUser(user.id as number);
      toast.success("Votre compte a été supprimé avec succès.");
      await logout();
      navigate("/");
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, "Impossible de supprimer le compte.");
      toast.error(errorMessage);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Mon Profil</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {!isEditing ? (
          <>
            <UserCard user={user} />
            {canEdit && (
              <Button variant="primary" onClick={() => setIsEditing(true)} className="mt-6">
                Modifier mes informations
              </Button>
            )}

            {isOwnProfile && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Sécurité</h2>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      Changer le mot de passe
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Modifier votre mot de passe pour sécuriser votre compte.
                    </p>
                    <PasswordForm userId={user.id as number} />
                  </div>

                  <div className="pt-8 border-t border-gray-100">
                    <h3 className="text-lg font-medium text-red-600 mb-2">Zone de danger</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      La suppression de votre compte est irréversible. Toutes vos données
                      personnelles seront anonymisées conformément au RGPD.
                    </p>
                    <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>
                      Supprimer mon compte
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Modifier le profil</h2>
              </div>
              {user.role === UserRole.individual ? (
                <IndividualProfileForm />
              ) : user.role === UserRole.shelter ? (
                <ShelterProfileForm siret={user.shelterProfile?.siret} />
              ) : (
                <AdminProfileForm />
              )}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                <Button variant="neutral" onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="px-8">
                  {isSubmitting ? "Enregistrement..." : "Sauvegarder les modifications"}
                </Button>
              </div>
            </form>
          </FormProvider>
        )}
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Supprimer définitivement votre compte ?"
        message="Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et vos données seront anonymisées."
        confirmLabel="Oui, supprimer"
        cancelLabel="Annuler"
      />
    </div>
  );
}
