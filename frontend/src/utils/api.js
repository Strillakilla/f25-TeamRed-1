// src/utils/api.js
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

function getToken() {
  return localStorage.getItem("bb.jwt") || "";
}

// Treat anything under /api/auth as public (no Authorization header)
function isAuthPath(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p.startsWith("/api/auth/");
}

export async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (!isAuthPath(path)) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const init = { method: "GET", ...options, headers };
  if (init.body && typeof init.body !== "string") init.body = JSON.stringify(init.body);

  const res = await fetch(API_BASE + path, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// Convenience auth helpers
export async function loginAuth(email, password) {
  return api("/api/auth/login", { method: "POST", body: { email, password } });
}
export async function registerAuth({ username, email, password }) {
  return api("/api/auth/register", { method: "POST", body: { username, email, password } });
}
export async function whoAmI() {
  return api("/api/auth/me");
}
