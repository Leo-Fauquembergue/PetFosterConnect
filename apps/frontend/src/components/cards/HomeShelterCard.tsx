import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";

type HomeShelterCardProps = {
  id: number;
  name: string;
  image: string;
  location: string;
};

export const HomeShelterCard = ({ id, name, image, location }: HomeShelterCardProps) => (
  <Link
    to={`/refuges/${id}`}
    className="group bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full hover:-translate-y-1 w-full max-w-sm"
  >
    <div className="h-72 overflow-hidden relative bg-gray-100">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity z-10" />
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      <div className="absolute left-4 bottom-4 z-20 text-white pr-4">
        <h3 className="text-xl font-bold font-montserrat shadow-black drop-shadow-sm leading-tight">
          {name}
        </h3>
      </div>
    </div>

    <div className="p-4 flex items-center gap-2 text-gray-600 text-sm bg-white flex-grow">
      <MapPin size={18} className="text-primary flex-shrink-0" />
      <span className="font-medium">{location}</span>
    </div>
  </Link>
);
