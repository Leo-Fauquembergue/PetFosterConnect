import { useNavigate, Link } from "react-router-dom";
import type { Animal, Species } from "@projet/shared-types";
import Badge from "./ui/Badge"; // Ajout de l'import du Badge pour la version "home"

// 1. Types de la carte par défaut
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

type AnimalCardDefaultProps = AnimalWithDetails & { variant?: "default" };

// 2. Types de la carte d'accueil
type AnimalCardHomeProps = {
  variant: "home";
  id: number;
  name: string;
  species: string;
  age: string;
  image: string;
  location: string;
};

// 3. Union des types
type AnimalCardProps = AnimalCardDefaultProps | AnimalCardHomeProps;

const AnimalCard = (props: AnimalCardProps) => {
  const navigate = useNavigate();

  // ==========================================
  // VARIANT: HOME (Ancien HomeAnimalCard)
  // ==========================================
  if (props.variant === "home") {
    const { id, name, species, age, image, location } = props;
    return (
      <Link 
        to={`/animaux/${id}`} 
        className="group bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col h-full hover:-translate-y-1"
      >
        {/* Image */}
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
        
        {/* Contenu */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="mb-2">
            <h3 className="text-2xl font-bold font-montserrat text-gray-800 group-hover:text-primary transition-colors">
              {name}
            </h3>
          </div>
          
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
  }

  // ==========================================
  // VARIANT: DEFAULT (Ancien AnimalCard)
  // ==========================================
  const { id, name, photos, age, species, shelter } = props;
  
  const mainPhoto = Array.isArray(photos) && photos.length > 0 
    ? (photos[0] as string) 
    : "https://via.placeholder.com/400x300?text=Pas+de+photo";  

  return (
    <div className="w-72 bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-64 w-full overflow-hidden bg-gray-100">
        <img
          src={mainPhoto}
          alt={`${name}`}
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