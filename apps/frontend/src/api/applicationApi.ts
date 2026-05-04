import type {
  ApplicationReceivedResponse,
  ApplicationSentResponse,
  CreateApplicationDto,
  UpdateApplicationStatusDto,
} from "@projet/shared-types";
import api from "./api";

export const applicationApi = {
  createApplication: async (data: CreateApplicationDto) => {
    const response = await api.post("/applications", data);
    return response.data;
  },

  getSentApplications: async (signal?: AbortSignal): Promise<ApplicationSentResponse[]> => {
    const response = await api.get("/applications/sent", { signal });
    return response.data;
  },

  getReceivedApplications: async (signal?: AbortSignal): Promise<ApplicationReceivedResponse[]> => {
    const response = await api.get("/applications/received", { signal });
    return response.data;
  },

  getAllApplicationsAdmin: async () => {
    const response = await api.get("/applications");
    return response.data;
  },

  updateApplicationStatus: async (
    candidateId: number,
    animalId: number,
    data: UpdateApplicationStatusDto
  ) => {
    const response = await api.patch(`/applications/${animalId}/${candidateId}/status`, data);
    return response.data;
  },

  deleteApplication: async (candidateId: number, animalId: number) => {
    const response = await api.delete(`/applications/${animalId}/${candidateId}`);
    return response.data;
  },

  cancelOwnApplication: async (animalId: number) => {
    const response = await api.delete(`/applications/me/${animalId}`);
    return response.data;
  },
};
