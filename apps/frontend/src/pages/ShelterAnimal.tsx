//page de la liste des refuge.
// url --> http://localhost:5173/refuges
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import _AnimalCard from "../components/cards/AnimalCard";
import BackBanner from "../components/ui/BackBanner";
import { shelterApi, type ShelterDetailResponse } from "../api/shelterApi";
import Loader from "../components/ui/Loader";

const ShelterAnimalsPage = () => {
  const { id } = useParams<{ id: string }>();

  const [shelter, setShelter] = useState<ShelterDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAnimals = async () => {
      if (!id) return;
      try {
        const data = await shelterApi.getShelterById(Number(id));
        setShelter(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAnimals();
  }, [id]);

  if (loading) return <Loader text="Chargement des animaux du refuge..." />;
  
  if (error) return <p className="text-center text-red-500 my-12 font-medium">Erreur lors du chargement des animaux.</p>;
  
  if (!shelter) return <p className="text-center text-gray-500 my-12 font-medium">Refuge introuvable</p>;

  return (
    <div className="bg-bgapp font-openSans text-gray-800">
      <BackBanner to="/refuges" />
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">
          {`Animaux du ${shelter.shelterName}`}
        </h1>

        {(!shelter.user?.animals || shelter.user.animals.length === 0) ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center mt-8">
            <span className="text-4xl mb-4">🐾</span>
            <p className="text-gray-600 text-lg font-medium">Aucun animal pour le moment.</p>
            <p className="text-gray-400 text-sm mt-2">Ce refuge n'a pas encore ajouté d'animaux à l'adoption.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {shelter.user.animals.map((animal: any) => (
              <Link key={animal.id} to={`/animaux/${animal.id}`}>
                <_AnimalCard {...animal} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShelterAnimalsPage;