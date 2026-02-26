import api from "./api";
import type { LoginDto, RegisterDto, User } from "@projet/shared-types";

export const authApi = {
  login: async (credentials: LoginDto) => {
    const response = await api.post<{ access_token: string; user: User }>("/auth/login", credentials);
    return response.data;
  },

  register: async (data: RegisterDto) => {
    const response = await api.post<{ access_token: string; user: User }>("/auth/register", data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },
};