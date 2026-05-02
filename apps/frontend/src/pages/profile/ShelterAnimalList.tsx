import { Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { animalApi } from "../../api/animalApi";
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
    type: "delete" | "restore";
    id: number;
  } | null>(null);

  const handleConfirmAction = async () => {
    if (!actionToConfirm) return;
    const { type, id: animalId } = actionToConfirm;

    try {
      if (type === "delete") {
        await animalApi.deleteAnimal(animalId);
        setAnimals(animals.map((a) => (a.id === animalId ? { ...a, deletedAt: new Date() } : a)));
        toast.success("Animal supprimé");
      } else {
        await animalApi.updateAnimal(animalId, { deletedAt: null });
        setAnimals(animals.map((a) => (a.id === animalId ? { ...a, deletedAt: null } : a)));
        toast.success("Animal restauré");
      }
    } catch (_error) {
      toast.error("Erreur lors de l'opération");
    }
    setActionToConfirm(null);
  };

  if (loading) return <Loader text="Chargement des animaux..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 font-montserrat">Gestion des Animaux</h1>
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

                    {animal.deletedAt ? (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          animal.id && setActionToConfirm({ type: "restore", id: animal.id })
                        }
                        className="text-primary hover:text-primary p-2"
                        title="Restaurer"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() =>
                          animal.id && setActionToConfirm({ type: "delete", id: animal.id })
                        }
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
        title={actionToConfirm?.type === "delete" ? "Supprimer l'animal ?" : "Restaurer l'animal ?"}
        message={
          actionToConfirm?.type === "delete"
            ? "Cette action placera l'animal dans la corbeille."
            : "L'animal sera de nouveau visible."
        }
        variant={actionToConfirm?.type === "delete" ? "danger" : "info"}
      />
    </div>
  );
}
