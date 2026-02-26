import api from "./api";

export const speciesApi = {
  getAllSpecies: async () => {
    const response = await api.get("/species");
    return response.data;
  },
};