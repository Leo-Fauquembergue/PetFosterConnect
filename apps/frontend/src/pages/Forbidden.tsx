import { useNavigate } from "react-router-dom";

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100 text-gray-800 px-4">
      <h1 className="text-6xl font-bold mb-4">403</h1>

      <p className="text-xl mb-2">Accès interdit.</p>

      <p className="mb-6 text-center max-w-md">
        Vous êtes bien connecté, mais vous n’avez pas les autorisations nécessaires pour accéder à
        cette page.
      </p>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
        >
          Page précédente
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-info text-white rounded hover:bg-info/90 transition"
        >
          Accueil
        </button>
      </div>
    </div>
  );
};

export default Forbidden;
