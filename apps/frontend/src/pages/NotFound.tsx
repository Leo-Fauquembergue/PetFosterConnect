import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  // redirection automatique après 5 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/"); // redirige vers la page d'accueil
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100 text-gray-800">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-2">
        Oups ! La page que vous cherchez n'existe pas.
      </p>
      <p className="mb-6">
        Vous allez être redirigé vers l'accueil dans 5 secondes.
      </p>
      <button
        type="button"
        onClick={() => navigate("/")}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Retour à l'accueil
      </button>
    </div>
  );
};

export default NotFound;
