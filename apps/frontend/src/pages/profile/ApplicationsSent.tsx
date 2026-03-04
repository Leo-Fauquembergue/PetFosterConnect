import { useEffect, useState } from "react";
import { applicationApi } from "../../api/applicationApi"
import { toast } from "react-toastify";
import type { ApplicationSentResponse } from "@projet/shared-types";
import Loader from "../../components/ui/Loader";
import { AxiosError } from "axios";

export default function ApplicationsSent() {
  const [applications, setApplications] = useState<ApplicationSentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationApi.getSentApplications()
      .then((data) => {
        setApplications(data);
      })
      .catch((error: unknown) => {
        const err = error as AxiosError<{ message: string }>;
        const errorMessage = err.response?.data?.message || "Erreur lors du chargement de vos candidatures.";
        toast.error(errorMessage);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loader text="Chargement de vos demandes..." />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Mes demandes envoyées</h1>
      
      {applications.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg shadow-sm border border-gray-100 mt-6">
          <span className="text-4xl mb-4">📨</span>
          <p className="text-gray-500 text-lg font-medium">Vous n’avez envoyé aucune demande pour le moment.</p>
        </div>
      )}

      <div className="space-y-4">
        {applications.map((app) => {
          // Extraction sécurisée de l'image
          const photos = app.animal?.photos as string[] | undefined;
          const mainPhoto = photos?.[0] || "https://placehold.co/80x80";

          return (
            <div
              key={`${app.pfcUserId}-${app.animalId}`}
              className="bg-white p-4 rounded-lg shadow border border-gray-100"
            >
              {/* Animal */}
              <div className="flex items-center gap-4">
                <img
                  src={mainPhoto}
                  alt={app.animal?.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div>
                  <h2 className="text-xl font-semibold">{app.animal?.name}</h2>
                  <p className="text-sm text-gray-500">
                    Demande :{" "}
                    {app.applicationType === "adoption" ? "Adoption" : "Famille d’accueil"}
                  </p>
                </div>
              </div>

              {/* Statut */}
              <div className="mt-3">
                <span
                  className={` inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    app.applicationStatus === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : app.applicationStatus === "approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  } `}
                >
                  {app.applicationStatus === "pending" && "En attente"}
                  {app.applicationStatus === "approved" && "Acceptée"}
                  {app.applicationStatus === "rejected" && "Refusée"}
                </span>
              </div>

              {/* Message */}
              <p className="mt-3 text-gray-700 whitespace-pre-line">
                {app.message}
              </p>

              {/* Date */}
              <p className="mt-2 text-xs text-gray-400">
                Envoyée le {new Date(app.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}