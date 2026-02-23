import type { IndividualProfile, ShelterProfile } from "@projet/shared-types/src/profile.schema";

interface User {
  id: number;
  email: string;
  role: "individual" | "shelter" | "admin";
  phoneNumber?: string;
  address?: string;
  individualProfile?: IndividualProfile | null;
  shelterProfile?: ShelterProfile | null;
}

interface UserCardProps {
  user: User;
}

export default function UserCard({ user }: UserCardProps) {
  return (
    <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-6">
      {/* Header */}
      <h3 className="text-xl font-bold text-gray-800 mb-2">{user.email}</h3>   

      {/* Infos générales */}
      {user.phoneNumber && (
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Téléphone :</span> {user.phoneNumber}
        </p>
      )}
      {user.address && (
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Adresse :</span> {user.address}
        </p>
      )}

      {/* Profil particulier */}
      {user.role === "individual" && user.individualProfile && (
        <div className="mt-4">
          <h4 className="text-md font-bold text-success mb-2">Profil particulier</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>Logement : {user.individualProfile.housingType ?? "Non renseigné"}</li>
            <li>Surface : {user.individualProfile.surface ?? "?"} m²</li>
            <li>Jardin : {user.individualProfile.haveGarden ? "Oui" : "Non"}</li>
            <li>Animaux : {user.individualProfile.haveAnimals ? "Oui" : "Non"}</li>
            <li>Enfants : {user.individualProfile.haveChildren ? "Oui" : "Non"}</li>
            <li>Famille d’accueil : {user.individualProfile.availableFamily ? "Oui" : "Non"}</li>
            <li>
              {user.individualProfile.availableFamily && user.individualProfile.availableTime
                ? `Disponibilité: ${new Date(user.individualProfile.availableTime).toLocaleDateString("fr-FR")}`
                : null}
            </li>
          </ul>
        </div>
      )}

      {/* Profil refuge */}
      {user.role === "shelter" && user.shelterProfile && (
        <div className="mt-4">
          <h4 className="text-md font-bold text-success mb-2">Profil refuge</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
                {user.shelterProfile.logo 
                ? <img src={user.shelterProfile.logo} alt="Logo du refuge" className="h-12" /> 
                : "Non renseigné"}
            </li>
            <li>Nom du refuge : {user.shelterProfile.shelterName}</li>
            <li>SIRET : {user.shelterProfile.siret}</li>
            <li>Description : {user.shelterProfile.description ?? "Non renseignée"}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
