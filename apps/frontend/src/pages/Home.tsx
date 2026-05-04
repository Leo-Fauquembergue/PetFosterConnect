import { Link } from "react-router-dom";
import AnimalCard from "../components/cards/AnimalCard";
import ShelterCard from "../components/cards/ShelterCard";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import { useHomeData } from "../hooks/useHomeData";

export default function Home() {
  const { animals, shelters, loading } = useHomeData();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-bgapp">
        <Loader text="Chargement de l'accueil..." />
      </div>
    );
  }

  return (
    <div className="bg-bgapp font-openSans text-gray-800">
      {/* HERO SECTION */}
      <section className="relative bg-secondary py-20 lg:py-32 overflow-hidden border-t border-white/10 shadow-inner">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 transform translate-x-20" />
        <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
          {/* Texte Hero */}
          <div className="flex-1 text-center md:text-left text-white">
            <h1 className="text-4xl md:text-5xl font-bold font-montserrat mb-6 leading-tight">
              Offrez-leur un foyer, <br />
              <span className="text-primary/70">même temporaire.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-100 mb-8 max-w-lg mx-auto md:mx-0">
              Pet Foster Connect met en relation les refuges saturés avec des familles d'accueil et
              des adoptants aimants.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/animaux">
                <Button variant="primary">Je deviens Famille d'Accueil</Button>
              </Link>
              <Link to="/animaux">
                <Button variant="outline-white">Voir les animaux</Button>
              </Link>
            </div>
          </div>
          {/* Image Hero */}
          <div className="flex-1 flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?q=80&w=600&auto=format&fit=crop"
              alt="Chien et Chat heureux"
              className="rounded-2xl shadow-2xl border-4 border-white/20 w-full max-w-md object-cover transform rotate-2 hover:rotate-0 transition duration-500"
            />
          </div>
        </div>
      </section>

      {/* SECTION DERNIERS ANIMAUX */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold font-montserrat text-secondary mb-2">
                Les Derniers Animaux
              </h2>
              <p className="text-gray-500">Ils viennent d'arriver et attendent une famille.</p>
            </div>
            <Link
              to="/animaux"
              className="hidden md:block text-primary font-semibold hover:underline"
            >
              Voir tous les animaux →
            </Link>
          </div>

          {animals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {animals.map((animal) => (
                <div key={animal.id} className="w-full max-w-sm">
                  <AnimalCard animal={animal} variant="home" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 italic">
              Aucun animal à afficher pour le moment.
            </p>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link to="/animaux" className="text-primary font-semibold hover:underline">
              Voir tous les animaux →
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION REFUGES */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold font-montserrat text-secondary mb-2">
                Les Refuges Partenaires
              </h2>
              <p className="text-gray-500">Ils s'engagent au quotidien pour le bien-être animal.</p>
            </div>
            <Link
              to="/refuges"
              className="hidden md:block text-primary font-semibold hover:underline"
            >
              Voir tous les refuges →
            </Link>
          </div>

          {shelters.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {shelters.map((shelter) => (
                <div key={shelter.id} className="w-full max-w-sm">
                  <ShelterCard shelter={shelter} variant="home" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 italic">
              Nos refuges partenaires s'affichent bientôt ici.
            </p>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link to="/refuges" className="text-primary font-semibold hover:underline">
              Voir tous les refuges →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
