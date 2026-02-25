import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";
import IndividualProfileForm from "../profile/components/IndividualProfilForm";
import PasswordForm from "../profile/components/PasswordForm";
import ShelterProfileForm from "../profile/components/ShelterProfilForm";
import UserCard from "../../components/ui/UserCard";
import { toast } from "react-toastify";

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;

      try {
        const res = await api.get(`/users/${id}/profil`);
        const data = res.data;

        setUser(data);

        // Gestion des formulaires selon le rôle
        if (data.role === "individual" && data.individualProfile) {
          setFormData({
            email: data.email ?? "",
            phoneNumber: data.phoneNumber ?? "",
            address: data.address ?? "",
            surface: data.individualProfile.surface ?? 0,
            housingType: data.individualProfile.housingType ?? "other",
            haveGarden: data.individualProfile.haveGarden ?? false,
            haveAnimals: data.individualProfile.haveAnimals ?? false,
            haveChildren: data.individualProfile.haveChildren ?? false,
            availableFamily: data.individualProfile.availableFamily ?? false,
            availableTime: data.individualProfile.availableTime ?? "",
          });
        } else if (data.role === "shelter" && data.shelterProfile) {
          setFormData({
            email: data.email ?? "",
            phoneNumber: data.phoneNumber ?? "",
            address: data.address ?? "",
            shelterName: data.shelterProfile.shelterName ?? "",
            siret: data.shelterProfile.siret ?? "",
            description: data.shelterProfile.description ?? "",
          });
        }

        setLoading(false);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Impossible de charger le profil.";
        toast.error(errorMessage);
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (!user) return <p>Utilisateur introuvable</p>;

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = user.role === "individual" 
        ? `/users/${user.id}/individual-profile` 
        : `/users/${user.id}/shelter-profile`;

    const { password, ...profileData } = formData;
    
    try {
        const response = await api.put(endpoint, profileData);
        setUser({ ...user, ...response.data });
        setIsEditing(false);
        toast.success("Profil mis à jour avec succès !");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Impossible de mettre à jour le profil.";
      toast.error(errorMessage);
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

            {/* Bloc mot de passe toujours accessible */}
            <div className="mt-6 border-t pt-4">
              <h2 className="text-lg font-semibold">
                Modifier le mot de passe
              </h2>
              <PasswordForm userId={user.id} />
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {user.role === "individual" ? (
              <IndividualProfileForm
                formData={formData}
                onChange={handleChange}
              />
            ) : (
              <ShelterProfileForm formData={formData} onChange={handleChange} />
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
                className="bg-primary text-white px-4 py-2 rounded"
              >
                Sauvegarder
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
