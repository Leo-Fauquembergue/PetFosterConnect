import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { UIAnimal } from "../../api/mappers/animalMapper";
import Badge from "../ui/Badge";

interface AnimalCardProps {
  animal: UIAnimal;
  variant?: "default" | "home";
}

const AnimalCard = ({ animal, variant = "default" }: AnimalCardProps) => {
  const { id, name, age, speciesName, shelterName, mainPhoto } = animal;

  if (variant === "home") {
    return (
      <Link
        to={`/animaux/${id}`}
        className="group bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full hover:-translate-y-1"
      >
        <div className="h-72 overflow-hidden relative bg-gray-100">
          <img
            src={mainPhoto}
            alt={name}
            className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute top-3 right-3">
            <Badge
              label={speciesName}
              variant="neutral"
              className="bg-white/90 backdrop-blur-md text-gray-800 text-xs font-bold px-3 py-1 shadow-md border border-white/50"
            />
          </div>
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-2xl font-bold font-montserrat text-gray-800 group-hover:text-primary transition-colors mb-2">
            {name}
          </h3>
          <div className="text-sm text-gray-500 space-y-1 mb-4">
            <p>🎂 {age}</p>
            <p>📍 {shelterName}</p>
          </div>
          <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
            <span className="text-primary font-semibold text-sm group-hover:underline decoration-2 underline-offset-4">
              Voir le profil
            </span>
            <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    );
  }

  // Variante par défaut (Grille standard)
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
            <span className="font-medium text-gray-800">Espèce :</span> {speciesName}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-800">Âge :</span> {age}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-800">Refuge :</span> {shelterName}
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
          <span className="text-primary font-semibold text-sm group-hover:underline decoration-2 underline-offset-4">
            Plus d'infos
          </span>
          <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </Link>
  );
};

export default AnimalCard;
