import type { ShelterProfile } from "@projet/shared-types";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

type ShelterCardDefaultProps = ShelterProfile & { variant?: "default" };
type ShelterCardHomeProps = { variant: "home"; id: number; name: string; image: string; location: string; };

type ShelterCardProps = ShelterCardDefaultProps | ShelterCardHomeProps;

const ShelterCard = (props: ShelterCardProps) => {
  const isHome = props.variant === "home";
  
  const targetId = isHome ? props.id : props.pfcUserId;
  const displayName = isHome ? props.name : props.shelterName;
  const displayImage = isHome ? props.image : (props.logo ?? "https://placehold.co/200x200?text=Pas+de+logo");
  
  return (
    <div className="w-full max-w-sm">
      <Link to={`/refuges/${targetId}`} className="group bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full hover:-translate-y-1" >
        <div className="h-72 overflow-hidden relative bg-gray-100">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-10" />
          <img src={displayImage} alt={displayName} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${!isHome ? 'opacity-75' : ''}`} />
          
          <div className={`absolute left-4 z-20 text-white pr-4 ${isHome ? 'bottom-4' : 'top-4'}`}>
            <h3 className="text-xl font-bold font-montserrat shadow-black drop-shadow-sm leading-tight">{displayName}</h3>
          </div>
          
          {!isHome && props.description && (
            <div className="absolute bottom-4 left-3 z-20 text-white pr-4">
              <p className="text-sm text-white-600 ml-3 my-4 text-left">
                <span className="font-semibold">Description :</span>
              </p>
              <p className="text-sm text-white-600 ml-3 mb-4 text-left">{props.description}</p>
            </div>
          )}
        </div>

        {isHome && props.location && (
          <div className="p-4 flex items-center gap-2 text-gray-600 text-sm bg-white flex-grow">
            <MapPin size={18} className="text-primary flex-shrink-0" />
            <span className="font-medium">{props.location}</span>
          </div>
        )}
      </Link>
      
      {!isHome && (
        <div className="flex justify-center mt-4">
          <Link to={`/refuges/${targetId}/animaux`} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white shadow-md transition" >
            Voir les animaux
          </Link>
        </div>
      )}
    </div>
  );
};

export default ShelterCard;