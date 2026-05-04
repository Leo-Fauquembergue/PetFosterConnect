import type {
  Animal,
  AnimalWithRelations,
  CreateAnimalDto,
  UpdateAnimalDto,
} from "@projet/shared-types";
import api from "./api";

export const animalApi = {
  getAllAnimals: async (signal?: AbortSignal): Promise<AnimalWithRelations[]> => {
    const response = await api.get<AnimalWithRelations[]>("/animals", { signal });
    return response.data;
  },

  getLatestAnimals: async (signal?: AbortSignal): Promise<AnimalWithRelations[]> => {
    const response = await api.get<AnimalWithRelations[]>("/animals?limit=3", { signal });
    return response.data;
  },

  getAnimalById: async (id: number, signal?: AbortSignal): Promise<AnimalWithRelations> => {
    const response = await api.get<AnimalWithRelations>(`/animals/${id}`, { signal });
    return response.data;
  },

  createAnimal: async (data: CreateAnimalDto): Promise<Animal> => {
    const response = await api.post<Animal>(`/animals`, data);
    return response.data;
  },

  deleteAnimal: async (id: number): Promise<void> => {
    const response = await api.delete(`/animals/${id}`);
    return response.data;
  },

  updateAnimal: async (id: number, data: UpdateAnimalDto): Promise<Animal> => {
    const response = await api.patch<Animal>(`/animals/${id}`, data);
    return response.data;
  },

  // Méthodes Admin
  getAllAdmin: async (signal?: AbortSignal): Promise<AnimalWithRelations[]> => {
    const response = await api.get<AnimalWithRelations[]>("/animals/admin/all", { signal });
    return response.data;
  },

  deleteAnimalAdmin: async (id: number): Promise<void> => {
    const response = await api.delete(`/animals/${id}`);
    return response.data;
  },

  updateAnimalAdmin: async (id: number, data: Partial<Animal>): Promise<Animal> => {
    const response = await api.patch<Animal>(`/animals/${id}`, data);
    return response.data;
  },
};
