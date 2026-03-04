import api from "./api";
import type { 
  CreateApplicationDto, 
  UpdateApplicationStatusDto,
  ApplicationSentResponse,
  ApplicationReceivedResponse
} from "@projet/shared-types";

export const applicationApi = {
  createApplication: async (data: CreateApplicationDto) => {
    const response = await api.post("/applications", data);
    return response.data;
  },

  getSentApplications: async (): Promise<ApplicationSentResponse[]> => {
    const response = await api.get("/applications/sent");
    return response.data;
  },

  getReceivedApplications: async (): Promise<ApplicationReceivedResponse[]> => {
    const response = await api.get("/applications/received");
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
    const response = await api.patch(
      `/applications/${animalId}/${candidateId}/status`,
      data
    );
    return response.data;
  },

  acceptApplication: async (candidateId: number, animalId: number) => {
    const response = await api.post(`/applications/${candidateId}/${animalId}/accept`);
    return response.data;
  },

  rejectApplication: async (candidateId: number, animalId: number) => {
    const response = await api.post(`/applications/${candidateId}/${animalId}/reject`);
    return response.data;
  },

  deleteApplication: async (candidateId: number, animalId: number) => {
    const response = await api.delete(`/applications/${animalId}/${candidateId}`);
    return response.data;
  },
};