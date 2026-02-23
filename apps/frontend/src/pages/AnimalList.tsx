import { PawPrint } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AnimalCard from "../components/AnimalCard";
import Loader from "../components/ui/Loader";

const API_URL = import.meta.env.VITE_API_URL;

const AnimalList = () => {
  const [animals, setAnimals] = useState<any[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const response = await fetch(`${API_URL}/animals`);
        if (!response.ok) throw new Error("Erreur réseau");
        const data = await response.json();
        setAnimals(data);
        setFilteredAnimals(data); // Initialise aussi la liste filtrée
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAnimals();
  }, []);

  // Filtrage en temps réel
  useEffect(() => {
    const filtered = animals.filter((animal) => {
      const searchLower = searchTerm.toLowerCase();
      return animal.name?.toLowerCase().includes(searchLower);
    });
    setFilteredAnimals(filtered);
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
        <p className="text-gray-500">
          Vérifiez votre connexion ou réessayez plus tard.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Nos animaux à adopter
          </h1>
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
            <h3 className="text-xl font-bold text-gray-700">
              Aucun animal pour le moment
            </h3>
            <p className="text-gray-500 mt-2">
              Revenez plus tard, nos refuges ajoutent régulièrement de nouveaux
              compagnons !
            </p>
          </div>
        ) : (
          <>
            {/* Barre de recherche */}
            <div className="mb-6">
              <div className="relative max-w">
                <input
                  type="text"
                  placeholder="Rechercher par nom"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Search icon</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <title>Clear search icon</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {filteredAnimals.length} résultat
                {filteredAnimals.length > 1 ? "s" : ""} trouvé
                {filteredAnimals.length > 1 ? "s" : ""}
              </p>
            </div>

            {/* Grille des animaux */}
            {filteredAnimals.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-gray-500">
                  Aucun animal ne correspond à votre recherche
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                {filteredAnimals.map((animal) => (
                  <Link to={`/animaux/${animal.id}`} key={animal.id}>
                    <AnimalCard {...animal} />
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AnimalList;
