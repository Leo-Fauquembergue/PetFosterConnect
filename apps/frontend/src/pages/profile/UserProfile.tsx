import type { IndividualProfile, ShelterProfile, User } from "@projet/shared-types";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { userApi } from "../../api/userApi";
import UserCard from "../../components/cards/UserCard";
import IndividualProfileForm from "../../components/profile/IndividualProfileForm";
import PasswordForm from "../../components/profile/PasswordForm";
import ShelterProfileForm from "../../components/profile/ShelterProfileForm";

// ⚡ Typage strict englobant les relations Prisma optionnelles
type UserWithProfiles = User & {
  individualProfile?: IndividualProfile | null;
  shelterProfile?: ShelterProfile | null;
};

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();

  // ⚡ Fin du festival du `any`
  const [user, setUser] = useState<UserWithProfiles | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ⚡ Typage du state formulaire
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;
      try {
        const data = await userApi.getProfile(Number(id));
        const userData = data as UserWithProfiles;

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
        setLoading(false);
      } catch (err: unknown) {
        // ⚡ Vrai Type Guard pour éviter les crashs sur des erreurs natives
        let errorMessage = "Impossible de charger le profil.";
        if (isAxiosError(err)) {
          errorMessage = err.response?.data?.message || errorMessage;
        }
        toast.error(errorMessage);
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (!user) return <p>Utilisateur introuvable</p>;

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { password, ...profileData } = formData;

    try {
      let updatedUser: UserWithProfiles;

      // Les données sont castées ici car les formulaires enfants valident la structure
      if (user.role === "individual") {
        updatedUser = (await userApi.updateIndividualProfile(
          user.id as number,
          profileData as any
        )) as UserWithProfiles;
      } else {
        updatedUser = (await userApi.updateShelterProfile(
          user.id as number,
          profileData as any
        )) as UserWithProfiles;
      }

      setUser({ ...user, ...updatedUser });
      setIsEditing(false);
      toast.success("Profil mis à jour avec succès !");
    } catch (err: unknown) {
      let errorMessage = "Impossible de mettre à jour le profil.";
      if (isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      }
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
              {/* Le cast est safe car un user retourné par la DB a toujours un ID */}
              <PasswordForm userId={user.id as number} />
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {user.role === "individual" ? (
              <IndividualProfileForm formData={formData as any} onChange={handleChange} />
            ) : (
              <ShelterProfileForm formData={formData as any} onChange={handleChange} />
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
