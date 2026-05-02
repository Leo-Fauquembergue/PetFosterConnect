import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

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
        <Button variant="neutral" onClick={() => navigate(-1)}>
          Page précédente
        </Button>

        <Button variant="info" onClick={() => navigate("/")}>
          Accueil
        </Button>
      </div>
    </div>
  );
};

export default Forbidden;
