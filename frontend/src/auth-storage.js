export const AUTH_STORAGE_KEY = "ru_eats_auth";
// Fired when the API rejects our token, so the UI can drop the stale session.
export const SESSION_EXPIRED_EVENT = "dininru:session-expired";

function isExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function readStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    const auth = raw ? JSON.parse(raw) : null;
    if (auth && (!auth.token || isExpired(auth.token))) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return auth;
  } catch {
    return null;
  }
}

export function clearStoredAuth() {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {}
}

export function getStoredToken() {
  return readStoredAuth()?.token || null;
}
