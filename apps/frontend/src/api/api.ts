import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

/**
 * Extrait un message d'erreur d'une erreur Axios ou retourne un message par défaut.
 */
export function extractErrorMessage(error: unknown, defaultMessage: string): string {
  if (axios.isAxiosError(error)) {
    const errorData = error.response?.data as Record<string, unknown> | undefined;
    const message = errorData?.message;

    if (typeof message === "string") return message;

    if (message && typeof message === "object" && "errors" in message) {
      const errObj = message as { errors?: { message?: string } };
      if (errObj.errors?.message) {
        try {
          const parsedZodError = JSON.parse(errObj.errors.message);
          if (Array.isArray(parsedZodError) && parsedZodError[0]?.message) {
            return parsedZodError[0].message;
          }
        } catch (_e) {}
      }
    }

    if (typeof errorData?.error === "string") {
      return errorData.error;
    }
  }
  return defaultMessage;
}

const NO_REDIRECT_API_ROUTES = ["/auth/login", "/auth/register", "/auth/me"];

// État de rafraîchissement
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest.url || "";
    const currentPath = window.location.pathname;

    const isAuthApiRequest = NO_REDIRECT_API_ROUTES.some((route) => requestUrl.includes(route));

    // Gestion de l'erreur 403 (Interdit)
    if (status === 403 && currentPath !== "/interdit") {
      window.dispatchEvent(new CustomEvent("auth:forbidden"));
      return Promise.reject(error);
    }

    // Si ce n'est pas une 401, ou si c'est une 401 sur une route d'auth/retry, on gère la déconnexion
    if (status !== 401 || originalRequest._retry || isAuthApiRequest) {
      if (status === 401 && currentPath !== "/connexion" && currentPath !== "/inscription") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
      return Promise.reject(error);
    }

    // Gestion de la race condition pour le rafraîchissement
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await api.post("/auth/refresh");
      isRefreshing = false;
      processQueue();
      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      processQueue(refreshError, null);

      // Redirection si échec définitif du rafraîchissement
      if (currentPath !== "/connexion" && currentPath !== "/inscription") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
      return Promise.reject(refreshError);
    }
  }
);

export default api;
