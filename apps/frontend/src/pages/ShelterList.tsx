import { Home } from "lucide-react";
import ShelterCard from "../components/cards/ShelterCard";
import Loader from "../components/ui/Loader";
import { useShelters } from "../hooks/useShelters";

const SheltersPage = () => {
  const { shelters, loading, error } = useShelters();

  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Recherche des refuges partenaires..." />
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <p className="text-xl text-error font-semibold mb-2">
          Oups ! Impossible de charger les refuges.
        </p>
        <p className="text-gray-500">Vérifiez votre connexion ou réessayez plus tard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Nos refuges partenaires</h1>
          <p className="text-gray-600">
            Découvrez les associations qui œuvrent chaque jour pour le bien-être animal.
          </p>
        </div>

        {/* État vide ou liste */}
        {shelters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="bg-secondary/10 p-4 rounded-full mb-4">
              <Home className="w-12 h-12 text-secondary" />
            </div>
            <h3 className="text-xl font-bold text-gray-700">Aucun refuge trouvé</h3>
            <p className="text-gray-500 mt-2">
              Il semblerait qu'aucun refuge ne soit disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {shelters.map((shelter) => (
              <div key={shelter.pfcUserId} className="w-full max-w-sm">
                <ShelterCard {...shelter} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SheltersPage;
