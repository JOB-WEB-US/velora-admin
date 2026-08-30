import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Đọc token từ localStorage / store đã xác thực
    if (typeof window !== "undefined") {
      const authData = localStorage.getItem("admin_auth_storage");
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          const token = parsed?.state?.token;

          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch {
          // ignore
        }
      }
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
