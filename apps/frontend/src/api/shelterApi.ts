import api from "./api";
import type { ShelterProfile, User, AnimalWithRelations } from "@projet/shared-types";

export type ShelterWithRelations = ShelterProfile & {
  user?: User;
};

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
};