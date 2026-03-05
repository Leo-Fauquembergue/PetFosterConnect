import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

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
        // Redirection vers la vraie route de connexion
        window.location.replace("/connexion");
      }
    } else if (status === 403 && currentPath !== "/interdit") {
      window.location.replace("/interdit");
    }

    return Promise.reject(error);
  }
);

export default api;
