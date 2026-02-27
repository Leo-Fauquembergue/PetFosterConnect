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

  logout: async () => {
    // Fait un appel à la route backend qui efface le cookie HttpOnly
    const response = await api.post('/auth/logout'); 
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },
};