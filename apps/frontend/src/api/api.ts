import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

/**
 * Extrait un message d'erreur d'une erreur Axios ou retourne un message par défaut.
 * Gère également l'extraction des messages d'erreur Zod complexes.
 */
export function extractErrorMessage(error: unknown, defaultMessage: string): string {
  if (axios.isAxiosError(error)) {
    const errorData = error.response?.data as Record<string, unknown> | undefined;
    const message = errorData?.message;

    // 1. Si message est une chaîne simple, on l'utilise
    if (typeof message === "string") return message;

    // 2. Si message est un objet (potentiellement des erreurs Zod)
    if (message && typeof message === "object" && "errors" in message) {
      const errObj = message as { errors?: { message?: string } };
      if (errObj.errors?.message) {
        try {
          const parsedZodError = JSON.parse(errObj.errors.message);
          if (Array.isArray(parsedZodError) && parsedZodError[0]?.message) {
            return parsedZodError[0].message;
          }
        } catch (_e) {
          // Ignorer l'erreur de parsing
        }
      }
    }

    // 3. Fallback sur la propriété .error (souvent présente dans NestJS pour certaines exceptions)
    if (typeof errorData?.error === "string") {
      return errorData.error;
    }
  }
  return defaultMessage;
}

// Liste des endpoints API (Backend)
// Ce sont les appels vers le serveur qui ne doivent pas déclencher de redirection
const NO_REDIRECT_API_ROUTES = [
  "/auth/login", // Endpoint backend
  "/auth/register", // Endpoint backend
  "/auth/me", // Ajout de cette exception vitale pour éviter la boucle de redirection au 1er rendu
];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || "";

    // Vérifie si la requête API concernait l'authentification
    const isAuthApiRequest = NO_REDIRECT_API_ROUTES.some((route) => requestUrl.includes(route));

    if (isAuthApiRequest) {
      return Promise.reject(error);
    }

    const currentPath = window.location.pathname;

    // Gestion de l'erreur 401 (Non autorisé)
    if (status === 401) {
      // On vérifie si l'utilisateur n'est pas DÉJÀ sur la page de connexion ou d'inscription
      if (currentPath !== "/connexion" && currentPath !== "/inscription") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    } else if (status === 403 && currentPath !== "/interdit") {
      window.dispatchEvent(new CustomEvent("auth:forbidden"));
    }

    return Promise.reject(error);
  }
);

export default api;
