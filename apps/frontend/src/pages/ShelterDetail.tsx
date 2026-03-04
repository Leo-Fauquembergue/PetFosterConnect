import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BackBanner from "../components/ui/BackBanner";
import { shelterApi } from "../api/shelterApi";
// ⚡ CORRECTION : Import du type depuis le package partagé
import type { ShelterDetailResponse } from "@projet/shared-types";
import Loader from "../components/ui/Loader";

const RefugeDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const [shelter, setShelter] = useState<ShelterDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchShelter = async () => {
      if (!id) return;
      try {
        const data = await shelterApi.getShelterById(Number(id));
        setShelter(data);
      } catch (err: unknown) { // ⚡ Fin du any implicite
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchShelter();
  }, [id]);

  if (loading) return <Loader text="Chargement du refuge..." />;
  
  if (error) return <p className="text-center text-red-500 my-12 font-medium">Erreur lors du chargement du refuge.</p>;
  
  if (!shelter) return <p className="text-center text-gray-500 my-12 font-medium">Refuge introuvable</p>;

  return (
    <div className="bg-bgapp font-openSans text-gray-800">
      <BackBanner to="/refuges" />
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 font-montserrat">
          {shelter.shelterName}
        </h1>

        <div
          className="border-2 rounded-xl p-6 shadow-md flex flex-col md:flex-row gap-6 bg-bgapp font-openSans text-gray-800"
          style={{ borderColor: "#2D6A4F" }}
        >
          <img
            src={
              shelter.logo ?? "https://placehold.co/150x150?text=Pas+de+logo"
            }
            alt={`${shelter.shelterName} logo`}
            className="w-32 h-32 rounded-full object-cover bg-gray-200"
          />

          <div className="flex flex-col justify-start">
            <p className="text-sm text-gray-700 mb-2">
              <span className="font-semibold">SIRET :</span> {shelter.siret}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Description :</span>
            </p>
            {shelter.description && (
              <p className="text-gray-800">{shelter.description}</p>
            )}
          </div>
        </div>

        {/* Boutons navigation */}
        <div className="mt-6 flex gap-4 justify-center">
          {shelter?.pfcUserId && (
            <Link
              to={`/refuges/${shelter.pfcUserId}/animaux`}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-md transition"
            >
              Voir les animaux du refuge
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default RefugeDetailPage;