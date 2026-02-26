import { api } from "./api";
import type { Animal, AnimalWithRelations } from "@projet/shared-types";

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

  // --- Méthodes Admin ---
  getAllAdmin: async () => {
    const response = await api.get<Animal[]>("/animals/admin/all");
    return response.data;
  },

  deleteAnimalAdmin: async (id: number) => {
    const response = await api.delete(`/animals/${id}`);
    return response.data;
  },

  updateAnimalAdmin: async (id: number, data: Partial<Animal>) => {
    const response = await api.patch(`/animals/${id}`, data);
    return response.data;
  },
};