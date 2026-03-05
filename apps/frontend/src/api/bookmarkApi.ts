import api from "./api";

export const bookmarkApi = {
  toggleBookmark: async (animalId: number) => {
    const response = await api.post("/bookmarks/toggle", { animalId });
    return response.data;
  },
  getMyBookmarks: async () => {
    const response = await api.get("/bookmarks/me");
    return response.data;
  },
};
