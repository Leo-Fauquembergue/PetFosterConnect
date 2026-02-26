import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { applicationApi } from "../../api/applicationApi";
import type { Application as BaseApplication, Animal } from "@projet/shared-types";


// Type minimal pour le candidat (pas besoin de tout PfcUser)
type CandidateUser = {
  id: number;
  individualProfile?: {
    firstname?: string;
    lastname?: string;
  };
};

// Application enrichie avec relations
export type ApplicationWithRelations = BaseApplication & {
  animal: Animal;
  user: CandidateUser;
};

export default function ApplicationsReceived() {
  const [applications, setApplications] = useState<ApplicationWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationApi.getReceivedApplications()
      .then((data: ApplicationWithRelations[]) => setApplications(data))
      .finally(() => setLoading(false));
  }, []);

  const handleStatus = async (
    candidateId: number,
    animalId: number,
    status: "approved" | "rejected"
  ) => {
    try {
      if (status === "approved") {
        const res = await applicationApi.acceptApplication(candidateId, animalId);
        toast.success(
          `✅ Candidature acceptée pour ${res.application?.user?.individualProfile?.firstname ?? ""} ${res.application?.user?.individualProfile?.lastname ?? ""}.
          Un email de confirmation a été envoyé !`,
          { autoClose: 4000 }
        );
      } else {
        const res = await applicationApi.rejectApplication(candidateId, animalId);
        toast.error(
          `❌ Candidature refusée pour ${res.application?.user?.individualProfile?.firstname ?? ""} ${res.application?.user?.individualProfile?.lastname ?? ""}.
          Un email de notification a été envoyé.`,
          { autoClose: 4000 }
        );
      }
  
      // Met à jour l'état local pour refléter le nouveau statut
      setApplications((prev) =>
        prev.map((app) =>
          app.animalId === animalId && app.pfcUserId === candidateId
            ? { ...app, applicationStatus: status }
            : app
        )
      );
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Impossible de mettre à jour la candidature.";
      toast.error(`⚠️ Erreur: ${errorMessage}`, {
        autoClose: 5000,
      });
    }
  };
  
  const handleArchive = async (candidateId: number, animalId: number) => {
    await applicationApi.archiveApplication(candidateId, animalId);
    setApplications((prev) =>
      prev.filter(
        (app) =>
          !(app.animalId === animalId && app.pfcUserId === candidateId)
      )
    );
  };

  if (loading) {
    return <p className="text-center text-gray-500">Chargement…</p>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Demandes reçues</h1>

      {applications.length === 0 && (
        <p className="text-gray-600">Aucune demande reçue.</p>
      )}

      <div className="space-y-4">
        {applications.map((app) => (
          <div
            key={`${app.pfcUserId}-${app.animalId}`}
            className="bg-white p-4 rounded-lg shadow border border-gray-100"
          >
            {/* Animal */}
            <div className="flex items-center gap-4">
              <img
                src={app.animal?.photos?.[0] || "https://placehold.co/80x80"}
                alt={app.animal?.name}
                className="w-20 h-20 object-cover rounded-md"
              />

              <div>
                <h2 className="text-xl font-semibold">{app.animal?.name}</h2>
                <p className="text-sm text-gray-500">
                  Type :{" "}
                  {app.applicationType === "adoption"
                    ? "Adoption"
                    : "Famille d’accueil"}
                </p>
              </div>
            </div>

            {/* Candidat */}
            <div className="mt-4 bg-gray-50 p-3 rounded">
              <h3 className="font-semibold">Candidat</h3>
              <p>
                {app.user?.individualProfile?.firstname}{" "}
                {app.user?.individualProfile?.lastname}
              </p>
            </div>

            {/* Statut */}
            <div className="mt-3">
              <span
                className={`
                  inline-block px-3 py-1 rounded-full text-sm font-medium
                  ${
                    app.applicationStatus === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : app.applicationStatus === "approved"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }
                `}
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

            {/* Actions */}
            <div className="mt-4 flex gap-3">
              {app.applicationStatus === "pending" && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      handleStatus(app.pfcUserId, app.animalId, "approved")
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Accepter
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleStatus(app.pfcUserId, app.animalId, "rejected")
                    }
                    className="px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Refuser
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => handleArchive(app.pfcUserId, app.animalId)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded"
              >
                Archiver
              </button>
            </div>

            {/* Date */}
            <p className="mt-2 text-xs text-gray-400">
              Reçue le {new Date(app.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
