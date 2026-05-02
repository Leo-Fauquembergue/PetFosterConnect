import { Link } from "react-router-dom";
import Badge from "../ui/Badge";

type HomeAnimalCardProps = {
  id: number;
  name: string;
  species: string;
  age: string;
  image: string;
  location: string;
};

export const HomeAnimalCard = ({
  id,
  name,
  species,
  age,
  image,
  location,
}: HomeAnimalCardProps) => (
  <Link
    to={`/animaux/${id}`}
    className="group bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full hover:-translate-y-1"
  >
    <div className="h-72 overflow-hidden relative bg-gray-100">
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
      />
      <div className="absolute top-3 right-3">
        <Badge
          label={species}
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
        <p>📍 {location}</p>
      </div>
      <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
        <span className="text-primary font-semibold text-sm group-hover:underline decoration-2 underline-offset-4">
          Voir le profil
        </span>
        <span className="text-gray-300">→</span>
      </div>
    </div>
  </Link>
);
