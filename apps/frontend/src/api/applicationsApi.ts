import type { Application, Animal } from "@projet/shared-types";
import api from "./api"; // On utilise uniquement 'api'

type CandidateUser = {
  id: number;
  individualProfile?: {
    firstname?: string;
    lastname?: string;
  };
};

export type ApplicationWithAnimal = Application & {
  animal: Animal;
};

export type ApplicationWithRelations = Application & {
  animal: Animal;
  user: CandidateUser;
};

// GETTERS (Candidat & Refuge)

export async function getSentApplications(): Promise<ApplicationWithRelations[]> {
  const res = await api.get("/applications/sent");
  return res.data;
}

export async function getReceivedApplications(): Promise<ApplicationWithRelations[]> {
  const res = await api.get("/applications/received");
  return res.data;
}

// ACTIONS (Refuge)

export async function updateApplicationStatus(
  candidateId: number,
  animalId: number,
  status: "approved" | "rejected"
): Promise<Application> {
  // ✅ Remplacement de axios.patch par api.patch
  const res = await api.patch(
    `/applications/${animalId}/${candidateId}`,
    { applicationStatus: status }
  );
  return res.data;
}

export async function archiveApplication(
  candidateId: number,
  animalId: number
): Promise<Application> {
  // ✅ Remplacement de axios.delete par api.delete
  const res = await api.delete(
    `/applications/${animalId}/${candidateId}`
  );
  return res.data;
}

// ACTIONS RAPIDES (Boutons Accepter / Refuser)

export async function acceptApplication(candidateId: number, animalId: number) {
  const res = await api.post(`/applications/${candidateId}/${animalId}/accept`);
  return res.data;
}

export async function rejectApplication(candidateId: number, animalId: number) {
  const res = await api.post(`/applications/${candidateId}/${animalId}/reject`);
  return res.data;
}