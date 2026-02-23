import { useNavigate } from "react-router-dom";
import type { Animal, Species } from "../../../../packages/shared-types/src/animal.schema";

type AnimalWithDetails = Animal & {
  species: Species;
  shelter: {
    address: string | null;
    shelterProfile: {
      shelterName: string;
      description: string | null;
    } | null;
  };
};

const AnimalCard = ({
  id,
  name,
  photos,
  age,
  species,
  shelter,
}: AnimalWithDetails) => {
  const navigate = useNavigate();

  // On extrait l'image une seule fois de manière sécurisée
  const mainPhoto = Array.isArray(photos) && photos.length > 0 
    ? (photos[0] as string) 
    : "https://via.placeholder.com/400x300?text=Pas+de+photo";  

  return (
    <div className="w-72 bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-64 w-full overflow-hidden bg-gray-100">
        <img
          src={mainPhoto}
          alt={`Photo de ${name}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{name}</h3>
        <div className="space-y-1 mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-800">Espèce :</span> {species?.name || 'Inconnue'}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-800">Âge :</span> {age || 'Non précisé'}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-800">Refuge :</span> {shelter?.shelterProfile?.shelterName || 'Chargement...'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/animaux/${id}`)}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-[0.98] active:scale-95"
        >
          Plus d'infos
        </button>
      </div>
    </div>
  );
};

export default AnimalCard;