//page de la liste des refuge.
// url --> http://localhost:5173/refuges
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import _AnimalCard from "../components/AnimalCard";
import BackBanner from "../components/ui/BackBanner";
import { api } from "../api/api";

const ShelterAnimalsPage = () => {
  const { id } = useParams<{ id: string }>();

  const [shelter, setShelter] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        const response = await api.get(`/shelters/${id}`);
        setShelter(response.data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAnimals();
  }, [id]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur !</p>;
  if (!shelter) return <p>Refuge introuvable</p>;

  return (
    <div className="bg-bgapp font-openSans text-gray-800">
      <BackBanner to="/refuges" />
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">
          {`Animaux du ${shelter.shelterName}`}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {shelter.user?.animals?.map((animal: any) => (
            <Link key={animal.id} to={`/animaux/${animal.id}`}>
              <_AnimalCard {...animal} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShelterAnimalsPage;
