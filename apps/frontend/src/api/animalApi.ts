import { api } from "./api";
import type { AnimalWithRelations } from "@projet/shared-types";

export const animalApi = {
  getAllAnimals: async (): Promise<AnimalWithRelations[]> => {
    const response = await api.get<AnimalWithRelations[]>("/animals");
    return response.data;
  },

  getLatestAnimals: async (): Promise<AnimalWithRelations[]> => {
    const response = await api.get<AnimalWithRelations[]>("/animals?limit=3");
    return response.data;
  },

  getAnimalById: async (id: number): Promise<any> => {
    const response = await api.get(`/animals/${id}`);
    return response.data;
  },
};