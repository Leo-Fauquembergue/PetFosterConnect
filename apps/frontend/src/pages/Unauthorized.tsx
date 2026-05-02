import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

const Unauthorized = () => {
  const navigate = useNavigate();

  // Redirection automatique après 5 secondes vers login
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/connexion");
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100 text-gray-800 px-4">
      <h1 className="text-6xl font-bold mb-4">401</h1>
      <p className="text-xl mb-2">Vous n'êtes pas autorisé à accéder à cette page.</p>
      <p className="mb-6">Vous allez être redirigé vers la page de connexion dans 5 secondes.</p>
      <div className="flex gap-4">
        <Button variant="info" onClick={() => navigate("/")}>
          Accueil
        </Button>
        <Button variant="neutral" onClick={() => navigate("/connexion")}>
          Connexion
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
