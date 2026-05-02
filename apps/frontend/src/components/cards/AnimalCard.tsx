import type { AnimalWithRelations } from "@projet/shared-types";
import { Link } from "react-router-dom";

type AnimalCardProps = AnimalWithRelations;

const AnimalCard = ({ id, name, photos, age, species, shelter }: AnimalCardProps) => {
  const mainPhoto =
    Array.isArray(photos) && photos.length > 0
      ? (photos[0] as string)
      : "https://via.placeholder.com/400x300?text=Pas+de+photo";

  return (
    <Link
      to={`/animaux/${id}`}
      className="group w-72 bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-64 w-full overflow-hidden bg-gray-100">
        <img
          src={mainPhoto}
          alt={`${name}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary transition-colors">
          {name}
        </h3>
        <div className="space-y-1 mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-800">Espèce :</span>{" "}
            {species?.name || "Inconnue"}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-800">Âge :</span> {age || "Non précisé"}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-800">Refuge :</span>{" "}
            {shelter?.shelterProfile?.shelterName || "Chargement..."}
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
          <span className="text-primary font-semibold text-sm group-hover:underline decoration-2 underline-offset-4">
            Plus d'infos
          </span>
          <span className="text-gray-300">→</span>
        </div>
      </div>
    </Link>
  );
};

export default AnimalCard;
