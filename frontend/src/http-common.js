import axios from "axios";
import { getStoredToken } from "./auth-storage";

// The backend (Express) listens on its own port/host (see backend/.env
// locally, or REACT_APP_API_URL in production). Override with
// REACT_APP_API_URL if the backend lives somewhere else.
const apiRoot = process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1";

const http = axios.create({
  baseURL: apiRoot,
  headers: {
    "Content-type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;
