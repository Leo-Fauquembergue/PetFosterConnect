import type { LoginDto, RegisterDto, UserWithProfiles } from "@projet/shared-types";
import api from "./api";

export const authApi = {
  login: async (credentials: LoginDto) => {
    const response = await api.post<{ access_token: string; user: UserWithProfiles }>(
      "/auth/login",
      credentials
    );
    return response.data;
  },

  register: async (data: RegisterDto) => {
    const response = await api.post<{ access_token: string; user: UserWithProfiles }>(
      "/auth/register",
      data
    );
    return response.data;
  },

  logout: async () => {
    // Fait un appel à la route backend qui efface le cookie HttpOnly
    const response = await api.post("/auth/logout");
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<UserWithProfiles>("/auth/me");
    return response.data;
  },
};
