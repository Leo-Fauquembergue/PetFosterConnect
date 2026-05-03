import type { LoginDto, RegisterDto, UserWithProfiles } from "@projet/shared-types";
import api from "./api";

export const authApi = {
  getCsrfToken: async () => {
    const response = await api.get<{ csrfToken: string }>("/auth/csrf");
    api.defaults.headers.common["x-csrf-token"] = response.data.csrfToken;
    return response.data.csrfToken;
  },

  login: async (credentials: LoginDto) => {
    const response = await api.post<{
      access_token: string;
      user: UserWithProfiles;
      csrfToken: string;
    }>("/auth/login", credentials);
    // On met à jour le header CSRF immédiatement après la connexion
    api.defaults.headers.common["x-csrf-token"] = response.data.csrfToken;
    return response.data;
  },

  register: async (data: RegisterDto) => {
    const response = await api.post<{
      access_token: string;
      user: UserWithProfiles;
      csrfToken: string;
    }>("/auth/register", data);
    // On met à jour le header CSRF immédiatement après l'inscription
    api.defaults.headers.common["x-csrf-token"] = response.data.csrfToken;
    return response.data;
  },

  logout: async () => {
    // Fait un appel à la route backend qui efface le cookie HttpOnly
    const response = await api.post("/auth/logout");
    // Optionnel : On peut remettre un token bidon pour les futures requêtes anonymes
    api.defaults.headers.common["x-csrf-token"] = "initial";
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<UserWithProfiles>("/auth/me");
    return response.data;
  },
};
