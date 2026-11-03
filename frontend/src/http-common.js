import axios from "axios";
import { clearStoredAuth, getStoredToken, SESSION_EXPIRED_EVENT } from "./auth-storage";

// The backend (Express) listens on its own port/host (see backend/.env
// locally, or REACT_APP_API_URL in production). Override with
// REACT_APP_API_URL if the backend lives somewhere else.
const apiRoot = process.env.REACT_APP_API_URL || "http://localhost:8000/api/v1";

const http = axios.create({
  baseURL: apiRoot,
  // The free-tier API host sleeps when idle and can take ~50s to wake up.
  timeout: 70000,
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

// A 401 on a request we sent a token with means the session is stale
// (expired, or signed with an old server secret): log the user out.
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      clearStoredAuth();
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  }
);
