import api from "./api";
import type { 
  ShelterWithRelations, 
  ShelterDetailResponse, 
  AnimalWithRelations 
} from "@projet/shared-types";

export const shelterApi = {
  getAllShelters: async (): Promise<ShelterWithRelations[]> => {
    const response = await api.get<ShelterWithRelations[]>("/shelters");
    return response.data;
  },

  getFeaturedShelters: async (): Promise<ShelterWithRelations[]> => {
    const response = await api.get<ShelterWithRelations[]>("/shelters?limit=3");
    return response.data;
  },

  getShelterAnimals: async (id: number): Promise<AnimalWithRelations[]> => {
    const response = await api.get<AnimalWithRelations[]>(`/shelters/${id}/animals`);
    return response.data;
  },

  getShelterById: async (id: number): Promise<ShelterDetailResponse> => {
    const response = await api.get<ShelterDetailResponse>(`/shelters/${id}`);
    return response.data;
  },
};