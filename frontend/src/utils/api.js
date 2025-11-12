// src/utils/api.js
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

function getToken() { return localStorage.getItem("bb.jwt") || ""; }
function clearToken() { localStorage.removeItem("bb.jwt"); }

// Treat anything under /api/auth as public (no Authorization header)
function isAuthPath(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p.startsWith("/api/auth/");
}

export async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };

  if (!isAuthPath(path)) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const init = { method: "GET", ...options, headers };
  if (init.body && typeof init.body !== "string") init.body = JSON.stringify(init.body);

  const res = await fetch(API_BASE + path, init);

  // Handle expired/invalid tokens gracefully
  if (res.status === 401 || res.status === 403) {
    if (!isAuthPath(path)) {
      clearToken();
      // broadcast so the app can react (e.g., show login)
      window.dispatchEvent(new Event("auth:expired"));
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `${res.status} ${res.statusText}`);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}
