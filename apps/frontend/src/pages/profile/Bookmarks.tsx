import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/api"; // ton instance Axios
import { useAuth } from "../../auth/AuthContext";

export default function BookmarksPage() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.get("/bookmarks/me")
      .then(res => setBookmarks(res.data))
      .catch((err: any) => {
        const errorMessage = err.response?.data?.message || "Impossible de charger vos favoris ❌";
        toast.error(errorMessage, { position: "top-right" });
      })
      .finally(() => setLoading(false));
  }, [user]);

  const handleToggle = async (animalId: number) => {
    try {
      const res = await api.post("/bookmarks/toggle", { animalId });
      // Met à jour la liste localement
      setBookmarks(prev => prev.filter(bm => bm.animalId !== animalId));

      // Feedback utilisateur
      toast.success(res.data.message, {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Erreur lors de la mise à jour du favori ❌";
      toast.error(errorMessage, { position: "top-right" });
    }
  };

  if (loading) {
    return <p className="text-gray-600">Chargement des favoris...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mes Favoris</h1>

      {bookmarks.length === 0 && (
        <p className="text-gray-600">Vous n’avez encore aucun favori.</p>
      )}

      <div className="space-y-4">
        {bookmarks.map((bm) => (
          <div
            key={`${bm.pfcUserId}-${bm.animalId}`}
            className="bg-white p-4 rounded-lg shadow border border-gray-100"
          >
            {/* Animal */}
            <div className="flex items-center gap-4">
              <img
                src={bm.animal?.photos?.[0] || "https://placehold.co/80x80"}
                alt={bm.animal?.name}
                className="w-20 h-20 object-cover rounded-md"
              />

              <div>
                {/* Lien vers la page détails */}
                <Link
                  to={`/animaux/${bm.animal.id}`}
                  className="text-xl font-semibold text-[#F28C28] hover:underline"
                >
                  {bm.animal?.name}
                </Link>
                <p className="text-sm text-gray-500">
                  Espèce : {bm.animal?.species?.name}
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="mt-3 text-gray-700 whitespace-pre-line">
              {bm.animal?.description || "Pas de description"}
            </p>

            {/* Actions */}
            <div className="mt-4 flex gap-3">
              <Link
                to={`/animaux/${bm.animal.id}`}
                className="px-4 py-2 bg-[#F28C28] text-white rounded hover:bg-[#F28C28]/80 transition"
              >
                Voir détails
              </Link>

              <button
                onClick={() => handleToggle(bm.animalId)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Retirer des favoris
              </button>
            </div>

            {/* Date d’ajout */}
            <p className="mt-2 text-xs text-gray-400">
              Ajouté le {new Date(bm.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
