import api from "./api";
import type { User, UpdateUserDto } from "@projet/shared-types";

export const userApi = {
  getAllUsers: async () => {
    const response = await api.get<User[]>("/users");
    return response.data;
  },

  deleteUser: async (id: number) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id: number, data: UpdateUserDto) => {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },
};