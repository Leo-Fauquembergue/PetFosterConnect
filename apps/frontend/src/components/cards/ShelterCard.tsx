import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { UIShelter } from "../../api/mappers/shelterMapper";

interface ShelterCardProps {
  shelter: UIShelter;
  variant?: "default" | "home";
}

const ShelterCard = ({ shelter, variant = "default" }: ShelterCardProps) => {
  const { id, name, logo, description, address } = shelter;

  if (variant === "home") {
    return (
      <Link
        to={`/refuges/${id}`}
        className="group bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full hover:-translate-y-1 w-full max-w-sm"
      >
        <div className="h-72 overflow-hidden relative bg-gray-100">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-10" />
          <img
            src={logo}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />

          <div className="absolute left-4 bottom-4 z-20 text-white pr-4">
            <h3 className="text-xl font-bold font-montserrat shadow-black drop-shadow-sm leading-tight">
              {name}
            </h3>
          </div>
        </div>

        <div className="p-4 flex items-center gap-2 text-gray-600 text-sm bg-white flex-grow">
          <MapPin size={18} className="text-primary flex-shrink-0" />
          <span className="font-medium">{address}</span>
        </div>
      </Link>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <Link
        to={`/refuges/${id}`}
        className="group bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full hover:-translate-y-1"
      >
        <div className="h-72 overflow-hidden relative bg-gray-100">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-10" />
          <img
            src={logo}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-75"
            loading="lazy"
          />

          <div className="absolute left-4 top-4 z-20 text-white pr-4">
            <h3 className="text-xl font-bold font-montserrat shadow-black drop-shadow-sm leading-tight">
              {name}
            </h3>
          </div>

          {description && (
            <div className="absolute bottom-4 left-3 z-20 text-white pr-4">
              <p className="text-sm text-white/80 ml-3 my-4 text-left">
                <span className="font-semibold">Description :</span>
              </p>
              <p className="text-sm text-white/80 ml-3 mb-4 text-left line-clamp-2">
                {description}
              </p>
            </div>
          )}
        </div>
      </Link>

      <div className="flex justify-center mt-4">
        <Link
          to={`/refuges/${id}/animaux`}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-md transition"
        >
          Voir les animaux
        </Link>
      </div>
    </div>
  );
};

export default ShelterCard;
