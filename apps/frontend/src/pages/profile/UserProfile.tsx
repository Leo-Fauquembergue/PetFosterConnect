import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// On n'importe plus "api" directement, on utilise ton fichier centralisé !
import { userApi } from "../../api/userApi";
import IndividualProfileForm from "../../components/profile/IndividualProfileForm";
import PasswordForm from "../../components/profile/PasswordForm";
import ShelterProfileForm from "../../components/profile/ShelterProfileForm";
import UserCard from "../../components/cards/UserCard";
import { toast } from "react-toastify";

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  // On garde "any" ici pour ne pas bloquer sur les relations (individualProfile / shelterProfile)
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return;

      try {
        // ⚡ Utilisation de ta méthode API propre
        const data = await userApi.getProfile(Number(id));
        
        // On force le type en any localement pour lire les relations sans erreur TS
        const userData: any = data;
        setUser(userData);

        // Gestion des formulaires selon le rôle
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
    setIsSubmitting(true); // ⚡ VERROUILLAGE

    const { password, ...profileData } = formData;

    try {
        let updatedUser: any; 
        
        if (user.role === "individual") {
          updatedUser = await userApi.updateIndividualProfile(user.id, profileData);
        } else {
          updatedUser = await userApi.updateShelterProfile(user.id, profileData);
        }

        setUser({ ...user, ...updatedUser });
        setIsEditing(false);
        toast.success("Profil mis à jour avec succès !");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Impossible de mettre à jour le profil.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false); // ⚡ DÉVERROUILLAGE
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
              <h2 className="text-lg font-semibold">Modifier le mot de passe</h2>
              <PasswordForm userId={user.id} />
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {user.role === "individual" ? (
              <IndividualProfileForm formData={formData} onChange={handleChange} />
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
                disabled={isSubmitting} // ⚡ AJOUT
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