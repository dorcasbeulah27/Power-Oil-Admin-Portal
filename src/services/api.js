import axios from "axios";

// Get API URL from environment variable
// In Railway, set VITE_API_URL to your backend URL (e.g., https://backend-production-xxxx.up.railway.app/api)
const API_BASE_URL =
  `${process.env.VITE_API_BASE_URL}/api` || "http://localhost:5000/api";

// Log API URL in development to help debug
if (import.meta.env.DEV) {
  console.log("🔗 Admin Portal API Base URL:", API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
      const errorMsg =
        error.code === "ERR_NETWORK"
          ? "Cannot connect to backend server. Please check your API URL configuration."
          : "Network error. Please try again.";
      error.userMessage = errorMsg;
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error("API route not found:", error.config?.url);
      error.userMessage =
        error.response?.data?.error ||
        "API endpoint not found. Please check your backend configuration.";
    }

    return Promise.reject(error);
  }
);

// Auth API
export const adminAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/profile"),
};

// Campaign API
export const campaignAPI = {
  getAll: (params) => api.get("/admin/campaigns", { params }),
  getById: (id) => api.get(`/admin/campaigns/${id}`),
  create: (data) => api.post("/admin/campaigns", data),
  update: (id, data) => api.put(`/admin/campaigns/${id}`, data),
  delete: (id) => api.delete(`/admin/campaigns/${id}`),
};

// Location API
export const locationAPI = {
  getAll: (params) => api.get("/admin/locations", { params }),
  getById: (id) => api.get(`/admin/locations/${id}`),
  create: (data) => api.post("/admin/locations", data),
  update: (id, data) => api.put(`/admin/locations/${id}`, data),
  delete: (id) => api.delete(`/admin/locations/${id}`),
  bulkUpload: (locations) => {
    return api.post("/admin/locations/bulk-upload", { locations });
  },
};

// Prize API
export const prizeAPI = {
  getAll: (params) => api.get("/admin/prizes", { params }),
  getById: (id) => api.get(`/admin/prizes/${id}`),
  create: (data) => api.post("/admin/prizes", data),
  update: (id, data) => api.put(`/admin/prizes/${id}`, data),
  delete: (id) => api.delete(`/admin/prizes/${id}`),
};

// Prize Rules API
export const prizeRuleAPI = {
  getAll: (params) => api.get("/admin/prize-rules", { params }),
  getById: (id) => api.get(`/admin/prize-rules/${id}`),
  create: (data) => api.post("/admin/prize-rules", data),
  update: (id, data) => api.put(`/admin/prize-rules/${id}`, data),
  delete: (id) => api.delete(`/admin/prize-rules/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: (params) => api.get("/admin/dashboard/stats", { params }),
  getReportsStats: (params) => api.get("/admin/reports/stats", { params }),
  getSpinHistory: (params) => api.get("/admin/spins/history", { params }),
  getRegisteredUsersReport: (params) =>
    api.get("/admin/reports/users", { params }),
  getWinningDetailsReport: (params) =>
    api.get("/admin/reports/winnings", { params }),
};

export default api;
