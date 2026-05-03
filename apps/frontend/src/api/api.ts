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

type QueueItem = {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};

let failedQueue: QueueItem[] = [];

const REFRESH_TIMEOUT = 10000;

const processQueue = (error: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(null);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const currentPath = window.location.pathname;

    const requestUrl = originalRequest.url || "";
    const isAuthApiRequest = NO_REDIRECT_API_ROUTES.some((route) => requestUrl.includes(route));

    if (status === 403 && currentPath !== "/interdit") {
      window.dispatchEvent(new CustomEvent("auth:forbidden"));
      return Promise.reject(error);
    }

    if (status !== 401 || originalRequest._retry || isAuthApiRequest) {
      if (status === 401 && currentPath !== "/connexion" && currentPath !== "/inscription") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          if (originalRequest.signal?.aborted) {
            return Promise.reject(new axios.CanceledError("canceled"));
          }
          const csrfToken = api.defaults.headers.common["x-csrf-token"];
          const newConfig = {
            ...originalRequest,
            headers: axios.AxiosHeaders.concat(
              originalRequest.headers,
              csrfToken ? { "x-csrf-token": csrfToken } : {}
            ),
          };
          return api(newConfig);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshController = new AbortController();
    const timeoutId = setTimeout(() => refreshController.abort(), REFRESH_TIMEOUT);

    try {
      const refreshResponse = await api.post("/auth/refresh", undefined, { signal: refreshController.signal });
      clearTimeout(timeoutId);

      if (refreshResponse.data?.csrfToken) {
        api.defaults.headers.common["x-csrf-token"] = refreshResponse.data.csrfToken;
      }

      isRefreshing = false;
      processQueue(null);

      const csrfToken = api.defaults.headers.common["x-csrf-token"];
      const newConfig = {
        ...originalRequest,
        headers: axios.AxiosHeaders.concat(
          originalRequest.headers,
          csrfToken ? { "x-csrf-token": csrfToken } : {}
        ),
      };
      return api(newConfig);
    } catch (refreshError) {
      clearTimeout(timeoutId);
      isRefreshing = false;
      processQueue(refreshError);

      if (currentPath !== "/connexion" && currentPath !== "/inscription") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
      return Promise.reject(refreshError);
    }
  }
);

export default api;
