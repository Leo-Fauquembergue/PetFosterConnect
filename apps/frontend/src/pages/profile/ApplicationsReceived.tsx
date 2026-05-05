import { useState } from "react";
import { toast } from "react-toastify";
import { extractErrorMessage } from "../../api/api";
import { applicationApi } from "../../api/applicationApi";
import Button from "../../components/ui/Button";
import CompatibilityBadge from "../../components/ui/CompatibilityBadge";
import Loader from "../../components/ui/Loader";
import { useApplicationsReceived } from "../../hooks/useApplicationsReceived";

export default function ApplicationsReceived() {
  const { applications, setApplications, loading } = useApplicationsReceived();
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const handleStatus = async (
    candidateId: number,
    animalId: number,
    status: "approved" | "rejected",
    candidateEmail: string // ⚡ On passe l'email pour le toast
  ) => {
    const uniqueId = `${candidateId}-${animalId}`;
    setActionLoadingId(uniqueId);

    try {
      await applicationApi.updateApplicationStatus(candidateId, animalId, {
        applicationStatus: status === "approved" ? "approved" : "rejected",
      });

      if (status === "approved") {
        toast.success(
          `Candidature acceptée pour ${candidateEmail}. Un email de confirmation a été envoyé !`,
          { autoClose: 4000 }
        );
      } else {
        toast.error(
          `Candidature refusée pour ${candidateEmail}. Un email de notification a été envoyé.`,
          { autoClose: 4000 }
        );
      }

      setApplications((prev) =>
        prev.map((app) =>
          app.animalId === animalId && app.pfcUserId === candidateId
            ? { ...app, applicationStatus: status }
            : app
        )
      );
    } catch (err: unknown) {
      const errorMessage = extractErrorMessage(err, "Impossible de mettre à jour la candidature.");
      toast.error(errorMessage);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleArchive = async (candidateId: number, animalId: number) => {
    const uniqueId = `${candidateId}-${animalId}`;
    setActionLoadingId(uniqueId);

    try {
      // ⚡ CORRECTION : Appel de deleteApplication au lieu de archiveApplication
      await applicationApi.deleteApplication(candidateId, animalId);

      setApplications((prev) =>
        prev.filter((app) => !(app.animalId === animalId && app.pfcUserId === candidateId))
      );
      toast.success("Demande archivée avec succès !");
    } catch (_err: unknown) {
      toast.error("Erreur lors de l'archivage.");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return <Loader text="Chargement des demandes reçues..." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Demandes reçues</h1>

      {applications.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg shadow-sm border border-gray-100 mt-6">
          <span className="text-4xl mb-4">📥</span>
          <p className="text-gray-500 text-lg font-medium">Aucune demande reçue pour le moment.</p>
        </div>
      )}

      <div className="space-y-4">
        {applications.map((app) => {
          const uniqueId = `${app.pfcUserId}-${app.animalId}`;
          const isProcessing = actionLoadingId === uniqueId;

          // Extraction sécurisée de l'image
          const photos = app.animal?.photos as string[] | undefined;
          const mainPhoto = photos?.[0] || "https://placehold.co/80x80";

          return (
            <div key={uniqueId} className="bg-white p-4 rounded-lg shadow border border-gray-100">
              <div className="flex items-center gap-4">
                <img
                  src={mainPhoto}
                  alt={app.animal?.name}
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div>
                  <h2 className="text-xl font-semibold">{app.animal?.name}</h2>
                  <p className="text-sm text-gray-500">
                    Type : {app.applicationType === "adoption" ? "Adoption" : "Famille d’accueil"}
                  </p>
                </div>
              </div>

              <div className="mt-4 bg-gray-50 p-3 rounded">
                <h3 className="font-semibold mb-2">Candidat</h3>
                <p>{app.user?.email}</p>
                {app.user?.phoneNumber && (
                  <p className="text-sm text-gray-500 mb-2">{app.user.phoneNumber}</p>
                )}

                {/* Badges de profil du candidat (uniquement si en attente) */}
                {app.applicationStatus === "pending" && app.user?.individualProfile && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <CompatibilityBadge
                      label={
                        app.user.individualProfile.housingType === "house"
                          ? "Maison"
                          : app.user.individualProfile.housingType === "apartment"
                            ? "Appartement"
                            : "Autre"
                      }
                      isCompatible={true}
                    />
                    <CompatibilityBadge
                      label={app.user.individualProfile.haveGarden ? "Jardin" : "Pas de jardin"}
                      isCompatible={app.user.individualProfile.haveGarden}
                    />
                    <CompatibilityBadge
                      label={
                        app.user.individualProfile.haveAnimals ? "A des animaux" : "Pas d'animaux"
                      }
                      isCompatible={!app.user.individualProfile.haveAnimals} // On met en rouge si a déjà des animaux (attention requise)
                    />
                    <CompatibilityBadge
                      label={
                        app.user.individualProfile.haveChildren ? "A des enfants" : "Pas d'enfants"
                      }
                      isCompatible={!app.user.individualProfile.haveChildren} // On met en rouge si a des enfants (attention requise)
                    />
                  </div>
                )}
                {app.applicationStatus === "pending" && !app.user?.individualProfile && (
                  <p className="text-xs text-gray-400 italic mt-2">Profil non renseigné</p>
                )}
              </div>

              <div className="mt-3">
                <span
                  className={` inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    app.applicationStatus === "pending"
                      ? "bg-warning/10 text-warning"
                      : app.applicationStatus === "approved"
                        ? "bg-success/10 text-success"
                        : app.applicationStatus === "cancelled"
                          ? "bg-gray-100 text-gray-500"
                          : "bg-error/10 text-error"
                  } `}
                >
                  {app.applicationStatus === "pending" && "En attente"}
                  {app.applicationStatus === "approved" && "Acceptée"}
                  {app.applicationStatus === "rejected" && "Refusée"}
                  {app.applicationStatus === "cancelled" && "Annulée par le candidat"}
                </span>
              </div>

              <p className="mt-3 text-gray-700 whitespace-pre-line">{app.message}</p>

              <div className="mt-4 flex gap-3">
                {app.applicationStatus === "pending" && (
                  <>
                    <Button
                      disabled={isProcessing}
                      onClick={() =>
                        handleStatus(app.pfcUserId, app.animalId, "approved", app.user?.email)
                      }
                    >
                      {isProcessing ? "..." : "Accepter"}
                    </Button>
                    <Button
                      variant="danger"
                      disabled={isProcessing}
                      onClick={() =>
                        handleStatus(app.pfcUserId, app.animalId, "rejected", app.user?.email)
                      }
                    >
                      {isProcessing ? "..." : "Refuser"}
                    </Button>
                  </>
                )}
                <Button
                  variant="neutral"
                  disabled={isProcessing || app.applicationStatus === "pending"}
                  onClick={() => handleArchive(app.pfcUserId, app.animalId)}
                  title={
                    app.applicationStatus === "pending"
                      ? "Veuillez accepter ou refuser avant d'archiver"
                      : "Archiver la demande"
                  }
                >
                  {isProcessing ? "Traitement..." : "Archiver"}
                </Button>
              </div>

              <p className="mt-2 text-xs text-gray-400">
                Reçue le {new Date(app.createdAt).toLocaleDateString("fr-FR")}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
