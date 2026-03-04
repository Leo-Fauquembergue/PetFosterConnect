import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { bookmarkApi } from "../../api/bookmarkApi";
import { useAuth } from "../../auth/AuthContext";
import Loader from "../../components/ui/Loader";
// ⚡ Typage strict pour éviter les erreurs d'objets ou les AxiosError brutes
import type { AnimalWithRelations } from "@projet/shared-types";
import { AxiosError } from "axios";

// Interface locale pour mapper la réponse de l'API des favoris
export type BookmarkWithAnimal = {
  pfcUserId: number;
  animalId: number;
  createdAt: Date | string;
  animal: AnimalWithRelations;
};

export default function BookmarksPage() {
  const { user } = useAuth();
  // ⚡ Typage strict
  const [bookmarks, setBookmarks] = useState<BookmarkWithAnimal[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    bookmarkApi.getMyBookmarks()
      .then(data => setBookmarks(data))
      .catch((err: unknown) => { // ⚡ Fin du any
        const axiosError = err as AxiosError<{ message: string }>;
        const errorMessage = axiosError.response?.data?.message || "Impossible de charger vos favoris ❌";
        toast.error(errorMessage, { position: "top-right" });
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleToggle = async (animalId: number) => {
    setDeletingId(animalId); 
    try {
      const data = await bookmarkApi.toggleBookmark(animalId);
      
      setBookmarks(prev => prev.filter(bm => bm.animalId !== animalId));
      
      toast.success(data.message, {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (err: unknown) { // ⚡ Fin du any
      const axiosError = err as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || "Erreur lors de la mise à jour du favori ❌";
      toast.error(errorMessage, { position: "top-right" });
    } finally {
      setDeletingId(null); 
    }
  };

  if (loading) {
    return <Loader text="Chargement de vos favoris..." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mes favoris</h1>
      {bookmarks.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center mt-6">
          <span className="text-4xl mb-4">❤️</span>
          <p className="text-gray-600 text-lg font-medium">Vous n'avez aucun favori pour le moment.</p>
          <p className="text-gray-400 text-sm mt-2">Parcourez les animaux à l'adoption pour trouver votre futur compagnon !</p>
        </div>
      )}
      <div className="space-y-4">
        {bookmarks.map((bm) => {
          const isDeleting = deletingId === bm.animalId;
          return (
            <div key={`${bm.pfcUserId}-${bm.animalId}`} className="bg-white p-4 rounded-lg shadow border border-gray-100">
              <div className="flex items-center gap-4">
                <img
                  src={bm.animal?.photos?.[0] || "https://placehold.co/80x80"}
                  alt={bm.animal?.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div>
                  <Link to={`/animaux/${bm.animal.id}`} className="text-xl font-semibold text-[#F28C28] hover:underline">
                    {bm.animal?.name}
                  </Link>
                  <p className="text-sm text-gray-500">
                    Espèce : {bm.animal?.species?.name}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-gray-700 whitespace-pre-line">
                {bm.animal?.description || "Pas de description"}
              </p>
              <div className="mt-4 flex gap-3">
                <Link
                  to={`/animaux/${bm.animal.id}`}
                  className="px-4 py-2 bg-[#F28C28] text-white rounded hover:bg-[#F28C28]/80 transition"
                >
                  Voir détails
                </Link>
                <button
                  type="button"
                  onClick={() => handleToggle(bm.animalId)}
                  disabled={isDeleting}
                  className={`px-4 py-2 bg-red-600 text-white rounded transition ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}`}
                >
                  {isDeleting ? "Retrait..." : "Retirer des favoris"}
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Ajouté le {new Date(bm.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}