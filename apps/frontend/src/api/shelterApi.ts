import type {
  AnimalWithRelations,
  ShelterDetailResponse,
  ShelterWithRelations,
} from "@projet/shared-types";
import api from "./api";

export const shelterApi = {
  getAllShelters: async (signal?: AbortSignal): Promise<ShelterWithRelations[]> => {
    const response = await api.get<ShelterWithRelations[]>("/shelters", { signal });
    return response.data;
  },

  getFeaturedShelters: async (signal?: AbortSignal): Promise<ShelterWithRelations[]> => {
    const response = await api.get<ShelterWithRelations[]>("/shelters?limit=3", { signal });
    return response.data;
  },

  getShelterAnimals: async (id: number, signal?: AbortSignal): Promise<AnimalWithRelations[]> => {
    const response = await api.get<AnimalWithRelations[]>(`/shelters/${id}/animals`, { signal });
    return response.data;
  },

  getShelterById: async (id: number, signal?: AbortSignal): Promise<ShelterDetailResponse> => {
    const response = await api.get<ShelterDetailResponse>(`/shelters/${id}`, { signal });
    return response.data;
  },
};
