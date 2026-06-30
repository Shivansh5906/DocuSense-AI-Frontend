import axios from "axios";

// Automatically detect if the app is running locally or deployed
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

const defaultBaseURL = isLocalhost
  ? "http://127.0.0.1:8000/api/v1"
  : "https://docusense-ai-backend.onrender.com/api/v1";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultBaseURL,
});

// Automatically inject JWT token into all outbound request headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("docusense_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Automatically clear credentials and reload page on 401 Unauthorized responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("docusense_token");
      localStorage.removeItem("docusense_user");
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
