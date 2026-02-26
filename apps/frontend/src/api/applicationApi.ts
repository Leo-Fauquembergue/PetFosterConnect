import type { Application, Animal } from "@projet/shared-types";
import api from "./api";

type CandidateUser = {
  id: number;
  individualProfile?: {
    firstname?: string;
    lastname?: string;
  };
};

export type ApplicationWithRelations = Application & {
  animal: Animal;
  user: CandidateUser;
};

export const applicationApi = {
  getSentApplications: async (): Promise<ApplicationWithRelations[]> => {
    const res = await api.get<ApplicationWithRelations[]>("/applications/sent");
    return res.data;
  },

  getReceivedApplications: async (): Promise<ApplicationWithRelations[]> => {
    const res = await api.get<ApplicationWithRelations[]>("/applications/received");
    return res.data;
  },

  updateApplicationStatus: async (
    candidateId: number,
    animalId: number,
    status: "approved" | "rejected"
  ): Promise<Application> => {
    const res = await api.patch<Application>(
      `/applications/${animalId}/${candidateId}`,
      { applicationStatus: status }
    );
    return res.data;
  },

  archiveApplication: async (candidateId: number, animalId: number): Promise<Application> => {
    const res = await api.delete<Application>(`/applications/${animalId}/${candidateId}`);
    return res.data;
  },

  acceptApplication: async (candidateId: number, animalId: number) => {
    const res = await api.post(`/applications/${candidateId}/${animalId}/accept`);
    return res.data;
  },

  rejectApplication: async (candidateId: number, animalId: number) => {
    const res = await api.post(`/applications/${candidateId}/${animalId}/reject`);
    return res.data;
  },

  createApplication: async (data: { animalId: number; applicationType: string; message: string }) => {
    const res = await api.post("/applications", data);
    return res.data;
  },
};