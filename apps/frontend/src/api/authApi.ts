import type { LoginDto, RegisterDto, User } from "@projet/shared-types";
import api from "./api";

export const authApi = {
  login: async (credentials: LoginDto) => {
    const response = await api.post<{ access_token: string; user: User }>(
      "/auth/login",
      credentials
    );
    // Standardisation de l'état : on force un appel à /auth/me pour garantir que le contexte React
    // aura toujours exactement la même structure (id, email, role) qu'après un rafraîchissement
    const meResponse = await api.get<User>("/auth/me");
    return { access_token: response.data.access_token, user: meResponse.data };
  },

  register: async (data: RegisterDto) => {
    const response = await api.post<{ access_token: string; user: User }>("/auth/register", data);
    // Standardisation de l'état
    const meResponse = await api.get<User>("/auth/me");
    return { access_token: response.data.access_token, user: meResponse.data };
  },

  logout: async () => {
    // Fait un appel à la route backend qui efface le cookie HttpOnly
    const response = await api.post("/auth/logout");
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<User>("/auth/me");
    return response.data;
  },
};
