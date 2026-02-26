import type { ShelterProfile } from "@projet/shared-types";
import { Link } from "react-router-dom"; 


const ShelterCard = ({ shelterName, description, pfcUserId, logo}: ShelterProfile) => {
  return (
    <div className="w-full max-w-sm">
      {/* Toute la carte cliquable vers détails */}
      <Link
        to={`/refuges/${pfcUserId}`}
        className="group bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full hover:-translate-y-1"
      >
      <div className="h-72 overflow-hidden relative bg-gray-100">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-10">
          {/* Logo avec fallback */}
          <img
            src={logo ?? "https://placehold.co/200x200?text=Pas+de+logo"}
            alt={`${shelterName} logo`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-75" 
          />

          {/* Nom du refuge */}
          <div className="absolute top-4 left-4 z-20 text-white pr-4">
          <h3 className="text-xl font-bold font-montserrat shadow-black drop-shadow-sm leading-tight">
            {shelterName}
          </h3>
          </div>
          
          <div className="absolute bottom-4 left-3 z-20 text-white pr-4">
          {/* Description */}
            <p className="text-sm text-white-600 ml-3 my-4 text-left">
                <span className="font-semibold ">Description :</span>
              </p>
            {description && (
              <p className="text-sm text-white-600 ml-3 mb-4 text-left">{description}</p>
            )}
          </div>
        </div>
          
        </div>
      </Link>

      {/* Bouton secondaire vers animaux */}
      <div className="flex justify-center mt-4">
        <Link
          to={`/refuges/${pfcUserId}/animaux`}
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-md transition"
        >
          Voir les animaux
        </Link>
      </div>
    </div>
  );
};

export default ShelterCard;

