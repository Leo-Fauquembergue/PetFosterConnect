import { PawPrint, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AnimalCard from "../components/cards/AnimalCard";
import Loader from "../components/ui/Loader";
import { useAnimals } from "../hooks/useAnimals";

const AnimalList = () => {
  const { animals, loading, error } = useAnimals();
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrage en temps réel
  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const searchLower = searchTerm.toLowerCase();
      return animal.name?.toLowerCase().includes(searchLower);
    });
  }, [searchTerm, animals]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Recherche de compagnons..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
        <p className="text-xl text-error font-semibold mb-2">
          Oups ! Impossible de charger les animaux.
        </p>
        <p className="text-gray-500">Vérifiez votre connexion ou réessayez plus tard.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Nos animaux à adopter</h1>
          <p className="text-gray-600">
            Découvrez tous nos compagnons qui attendent une famille aimante
          </p>
        </div>

        {/* Gestion liste vide */}
        {animals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="bg-orange-100 p-4 rounded-full mb-4">
              <PawPrint className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-700">Aucun animal pour le moment</h3>
            <p className="text-gray-500 mt-2">
              Revenez plus tard, nos refuges ajoutent régulièrement de nouveaux compagnons !
            </p>
          </div>
        ) : (
          <>
            {/* Barre de recherche */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <input
                  type="text"
                  placeholder="Rechercher par nom"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            {/* Grille d'animaux */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredAnimals.map((animal) => (
                <Link
                  key={animal.id}
                  to={`/animaux/${animal.id}`}
                  className="block transition-transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl"
                >
                  <AnimalCard {...animal} />
                </Link>
              ))}
            </div>

            {/* Message si aucun résultat de recherche */}
            {filteredAnimals.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  Aucun animal ne correspond à votre recherche "{searchTerm}"
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AnimalList;
