import api from "./api";
import type { User, UpdateUserDto, UpdatePasswordDto } from "@projet/shared-types";

export const userApi = {
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>("/users");
    return response.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  updateUser: async (id: number, data: UpdateUserDto): Promise<User> => {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  updatePassword: async (id: number, data: UpdatePasswordDto): Promise<void> => {
    const response = await api.put(`/users/${id}/password`, data);
    return response.data;
  },
};