import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mindpulse_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: async (payload) => {
    const response = await api.post("/register", payload);
    return response.data;
  },
  login: async (payload) => {
    const response = await api.post("/login", payload);
    return response.data;
  },
  me: async () => {
    const response = await api.get("/me");
    return response.data;
  },
};

export const predictionService = {
  predict: async (payload) => {
    const response = await api.post("/predict", payload);
    return response.data;
  },
  history: async () => {
    const response = await api.get("/history");
    return response.data;
  },
};

export const aiService = {
  recommendations: async () => {
    const response = await api.post("/ai/recommendations");
    return response.data;
  },
  reflect: async (payload) => {
    const response = await api.post("/ai/reflection", payload);
    return response.data;
  },
  insights: async () => {
    const response = await api.post("/ai/insights");
    return response.data;
  },
};

export default api;
