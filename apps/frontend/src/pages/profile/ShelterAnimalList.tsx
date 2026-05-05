import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { animalApi } from "../../api/animalApi";
import { extractErrorMessage } from "../../api/api";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Loader from "../../components/ui/Loader";
import { useShelterAnimals } from "../../hooks/useShelterAnimals";

// Dictionnaire pour la traduction des statuts
const statusLabels: Record<string, string> = {
  available: "Disponible",
  adopted: "Adopté",
  foster_care: "En famille d'accueil",
  unavailable: "Indisponible",
};

export default function ShelterAnimalList() {
  const { id } = useParams<{ id: string }>();
  const { animals, setAnimals, loading } = useShelterAnimals(id);

  const [actionToConfirm, setActionToConfirm] = useState<{
    id: number;
  } | null>(null);

  const handleConfirmAction = async () => {
    if (!actionToConfirm) return;
    const { id: animalId } = actionToConfirm;

    try {
      await animalApi.deleteAnimal(animalId);
      setAnimals(animals.map((a) => (a.id === animalId ? { ...a, deletedAt: new Date() } : a)));
      toast.success("Animal supprimé");
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Erreur lors de la suppression");
      toast.error(message);
    }
    setActionToConfirm(null);
  };

  if (loading) return <Loader text="Chargement des animaux..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Animaux</h1>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Nom</th>
              <th className="px-6 py-4">Espèce</th>
              <th className="px-6 py-4 hidden sm:table-cell">Âge</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {animals.length > 0 ? (
              animals.map((animal) => (
                <tr key={animal.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">#{animal.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{animal.name}</td>
                  <td className="px-6 py-4">{animal.species?.name ?? "-"}</td>
                  <td className="px-6 py-4 hidden sm:table-cell text-gray-500">
                    {animal.age ?? "-"}
                  </td>
                  <td className="px-6 py-4">
                    {/* ⚡ AJOUT : Remplacement des variantes pour matcher le nouveau comportement */}
                    <Badge
                      label={statusLabels[animal.animalStatus] ?? animal.animalStatus}
                      variant={
                        animal.animalStatus === "available"
                          ? "success"
                          : animal.animalStatus === "adopted"
                            ? "info"
                            : animal.animalStatus === "foster_care"
                              ? "warning"
                              : "error"
                      }
                    />
                  </td>

                  <td className="px-6 py-4 text-right flex gap-2 justify-end">
                    <Link
                      to={`/utilisateur/${id}/animaux/${animal.id}`}
                      className="text-info hover:bg-info/10 p-2 rounded-full transition-colors"
                      title="Voir / Modifier"
                    >
                      <Pencil className="w-5 h-5" />
                    </Link>

                    {!animal.deletedAt &&
                      animal.animalStatus !== "adopted" &&
                      animal.animalStatus !== "foster_care" && (
                        <Button
                          variant="ghost"
                          onClick={() => animal.id && setActionToConfirm({ id: animal.id })}
                          className="text-gray-400 hover:text-error p-2"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Aucun animal trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        isOpen={!!actionToConfirm}
        onClose={() => setActionToConfirm(null)}
        onConfirm={handleConfirmAction}
        title="Supprimer l'animal ?"
        message="Cette action est définitive. L'animal ne sera plus visible publiquement et toutes les candidatures en attente seront automatiquement refusées."
        variant="danger"
      />
    </div>
  );
}
