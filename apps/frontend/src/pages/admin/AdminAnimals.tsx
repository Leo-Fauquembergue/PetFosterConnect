import { Eye, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { animalApi } from "../../api/animalApi";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Loader from "../../components/ui/Loader";
import { useAdminAnimals } from "../../hooks/useAdminAnimals";

export default function AdminAnimals() {
  const { animals, loading, setAnimals } = useAdminAnimals();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // État pour la modale
  const [actionToConfirm, setActionToConfirm] = useState<{
    id: number;
  } | null>(null);

  // FILTRAGE
  const filteredAnimals = animals.filter((animal) => {
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || animal.animalStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Ouverture de la modale (au lieu de confirm)
  const openDeleteModal = (id: number) => setActionToConfirm({ id });

  // Exécution de l'action confirmée
  const handleConfirmAction = async () => {
    if (!actionToConfirm) return;

    const { id } = actionToConfirm;

    try {
      await animalApi.deleteAnimalAdmin(id);
      setAnimals(animals.map((a) => (a.id === id ? { ...a, deletedAt: new Date() } : a)));
      toast.success("Animal supprimé avec succès");
    } catch (_error) {
      toast.error("Une erreur est survenue lors de la suppression");
    }
    setActionToConfirm(null);
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader text="Chargement des animaux..." />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 font-montserrat">Gestion des Animaux</h1>
      </div>

      {/* BARRE D'OUTILS */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par nom..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:border-primary cursor-pointer"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="available">Disponible</option>
          <option value="adopted">Adopté</option>
          <option value="foster_care">En famille d'accueil</option>
          <option value="unavailable">Indisponible</option>
        </select>
      </div>

      {/* TABLEAU */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Nom</th>
              <th className="px-6 py-4">Espèce</th>
              <th className="px-6 py-4">Refuge</th>
              <th className="px-6 py-4">Statut</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredAnimals.length > 0 ? (
              filteredAnimals.map((animal) => (
                <tr key={animal.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{animal.name}</td>
                  <td className="px-6 py-4 text-gray-600">{animal.species?.name || "Inconnu"}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {animal.shelter?.shelterProfile?.shelterName || "Inconnu"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      label={
                        animal.deletedAt
                          ? "Supprimé"
                          : animal.animalStatus === "available"
                            ? "Disponible"
                            : animal.animalStatus === "adopted"
                              ? "Adopté"
                              : animal.animalStatus === "foster_care"
                                ? "En famille d'accueil"
                                : "Indisponible"
                      }
                      variant={
                        animal.deletedAt
                          ? "error"
                          : animal.animalStatus === "available"
                            ? "success"
                            : animal.animalStatus === "adopted"
                              ? "info"
                              : animal.animalStatus === "foster_care"
                                ? "warning"
                                : "neutral"
                      }
                    />
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    {!animal.deletedAt &&
                    animal.shelter?.shelterProfile?.shelterName !== "COMPTE_SUPPRIME" ? (
                      <>
                        <a
                          href={`/animaux/${animal.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-primary p-2 rounded-full hover:bg-orange-50 transition-colors"
                          title="Voir la fiche publique"
                        >
                          <Eye className="w-5 h-5" />
                        </a>
                        <Button
                          variant="ghost"
                          onClick={() => animal.id && openDeleteModal(animal.id)}
                          className="text-gray-400 hover:text-error p-2"
                          title="Supprimer"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </>
                    ) : (
                      !animal.deletedAt && (
                        <a
                          href={`/animaux/${animal.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-primary p-2 rounded-full hover:bg-orange-50 transition-colors"
                          title="Voir la fiche publique"
                        >
                          <Eye className="w-5 h-5" />
                        </a>
                      )
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
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
        message="Cette action placera l'animal dans la corbeille. Il ne sera plus visible du public. Cette action est considérée comme définitive."
        variant="danger"
      />
    </div>
  );
}
