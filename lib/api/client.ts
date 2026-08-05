import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const DEFAULT_ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "velora_admin_secret_api_key_2026";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Read token & apiKey from localStorage / store
    if (typeof window !== "undefined") {
      const authData = localStorage.getItem("admin_auth_storage");
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          const token = parsed?.state?.token;
          const apiKey = parsed?.state?.apiKey || DEFAULT_ADMIN_KEY;

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          config.headers["X-Admin-API-Key"] = apiKey || DEFAULT_ADMIN_KEY;
        } catch {
          config.headers["X-Admin-API-Key"] = DEFAULT_ADMIN_KEY;
        }
      } else {
        config.headers["X-Admin-API-Key"] = DEFAULT_ADMIN_KEY;
      }
    } else {
      config.headers["X-Admin-API-Key"] = DEFAULT_ADMIN_KEY;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      console.warn("Unauthorized request - redirecting to login");
    }
    return Promise.reject(error);
  }
);
