export const AUTH_STORAGE_KEY = "ru_eats_auth";

export function readStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredToken() {
  return readStoredAuth()?.token || null;
}
