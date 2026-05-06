import { UserRole, type UserWithProfiles } from "@projet/shared-types";

interface UserCardProps {
  user: UserWithProfiles;
}

export default function UserCard({ user }: UserCardProps) {
  return (
    <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-6 overflow-hidden">
      {/* Header */}
      <h3 className="text-xl font-bold text-gray-800 mb-2 break-all">{user.email}</h3>

      {/* Infos générales */}
      {user.phoneNumber && (
        <p className="text-sm text-gray-700 break-words">
          <span className="font-semibold">Téléphone :</span> {user.phoneNumber}
        </p>
      )}
      {user.address && (
        <p className="text-sm text-gray-700 break-words">
          <span className="font-semibold">Adresse :</span> {user.address}
        </p>
      )}

      {/* Profil particulier */}
      {user.role === UserRole.individual && (
        <div className="mt-4">
          <h4 className="text-md font-bold text-success mb-2">Profil particulier</h4>
          {user.individualProfile ? (
            <ul className="text-sm text-gray-700 space-y-1">
              <li>
                Logement :{" "}
                {user.individualProfile.housingType === "house"
                  ? "Maison"
                  : user.individualProfile.housingType === "apartment"
                    ? "Appartement"
                    : user.individualProfile.housingType === "other"
                      ? "Autre"
                      : "Non renseigné"}
              </li>
              <li>Surface : {user.individualProfile.surface ?? "?"} m²</li>
              <li>Jardin : {user.individualProfile.haveGarden ? "Oui" : "Non"}</li>
              <li>Animaux : {user.individualProfile.haveAnimals ? "Oui" : "Non"}</li>
              <li>Enfants : {user.individualProfile.haveChildren ? "Oui" : "Non"}</li>
              <li>Famille d’accueil : {user.individualProfile.availableFamily ? "Oui" : "Non"}</li>
              {user.individualProfile.availableFamily && user.individualProfile.availableTime && (
                <li>Disponibilité: {user.individualProfile.availableTime}</li>
              )}
            </ul>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Profil non renseigné. Cliquez sur Modifier pour le compléter.
            </p>
          )}
        </div>
      )}

      {/* Profil refuge */}
      {user.role === UserRole.shelter && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-md font-bold text-primary mb-2">Informations Refuge</h4>
          {user.shelterProfile ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-800">
                {user.shelterProfile.shelterName || "Nom non renseigné"}
              </p>
              {user.shelterProfile.siret && (
                <p className="text-xs text-gray-500">SIRET : {user.shelterProfile.siret}</p>
              )}
              <p className="text-sm text-gray-600 italic line-clamp-3">
                {user.shelterProfile.description || "Aucune description fournie."}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">
              Profil refuge incomplet. Veuillez cliquer sur "Modifier" pour configurer votre refuge.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
