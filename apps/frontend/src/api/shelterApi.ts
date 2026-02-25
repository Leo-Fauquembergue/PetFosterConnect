import { api } from "./api";
import type { ShelterProfile, User } from "@projet/shared-types";

// Type déduit de la réponse du backend (ShelterProfile + User)
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
  }
};