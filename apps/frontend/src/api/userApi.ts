import type {
  UpdatePasswordDto,
  UpdateUserDto,
  UpdateUserWithIndividualProfileDto,
  UpdateUserWithShelterProfileDto,
  User,
} from "@projet/shared-types";
import api from "./api";

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

  getProfile: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}/profile`);
    return response.data;
  },

  updateIndividualProfile: async (
    id: number,
    data: UpdateUserWithIndividualProfileDto
  ): Promise<User> => {
    const response = await api.put<User>(`/users/${id}/individual-profile`, data);
    return response.data;
  },

  updateShelterProfile: async (
    id: number,
    data: UpdateUserWithShelterProfileDto
  ): Promise<User> => {
    const response = await api.put<User>(`/users/${id}/shelter-profile`, data);
    return response.data;
  },
};
