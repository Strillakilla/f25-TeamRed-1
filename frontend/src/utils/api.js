// src/utils/api.js
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

// --- auth token helpers ---
function getToken() { return localStorage.getItem("bb.jwt") || ""; }
function clearToken() { localStorage.removeItem("bb.jwt"); }

// Treat anything under /api/auth as public (no Authorization header)
function isAuthPath(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return p.startsWith("/api/auth/");
}

// --- generic JSON fetcher that adds Bearer token when needed ---
export async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };

  if (!isAuthPath(path)) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const init = { method: "GET", ...options, headers };
  if (init.body && typeof init.body !== "string") init.body = JSON.stringify(init.body);

  const res = await fetch(API_BASE + path, init);

  // Notify app on auth errors
  if ((res.status === 401 || res.status === 403) && !isAuthPath(path)) {
    clearToken();
    window.dispatchEvent(new Event("auth:expired"));
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `${res.status} ${res.statusText}`);
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// --- auth convenience wrappers (these are what Login.jsx imports) ---
export async function loginAuth(email, password) {
  return api("/api/auth/login", { method: "POST", body: { email, password } });
}
export async function registerAuth({ username, email, password }) {
  return api("/api/auth/register", { method: "POST", body: { username, email, password } });
}
export async function whoAmI() {
  return api("/api/auth/me");
}

// --- TMDB image helper via CDN ---
export const tmdbImg = (path, size = "w500") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : "";

/* ---------- Region + Provider helpers ---------- */
export const USER_REGION = (localStorage.getItem("bb.region") || "US").toUpperCase();

function pickRegion(results, region = USER_REGION) {
  // Supports both shapes:
  // 1) { results: { US: {...} } }   (TMDB default)
  // 2) { US: {...} }                 (some backends flatten it)
  const root = results?.results ?? results;
  return root?.[region] || null;
}

export function normalizeProviders(results, region = USER_REGION) {
  const r = pickRegion(results, region);
  if (!r) return { flatrate: [], ads: [], free: [], rent: [], buy: [], any: [] };

  const flat = (r.flatrate || []).map(p => p.provider_name);
  const ads  = (r.ads      || []).map(p => p.provider_name);
  const free = (r.free     || []).map(p => p.provider_name);
  const rent = (r.rent     || []).map(p => p.provider_name);
  const buy  = (r.buy      || []).map(p => p.provider_name);
  const any  = [...new Set([...flat, ...ads, ...free, ...rent, ...buy])];
  return { flatrate: flat, ads, free, rent, buy, any };
}

// --- Backend media wrappers ---
export const media = {
  movies: {
    nowPlaying: (p = 1, lang, region) =>
      api(`/api/media/movies/now_playing?page=${p}${lang ? `&language=${lang}` : ""}${region ? `&region=${region}` : ""}`),
    popular: (p = 1, lang, region) =>
      api(`/api/media/movies/popular?page=${p}${lang ? `&language=${lang}` : ""}${region ? `&region=${region}` : ""}`),
    topRated: (p = 1, lang, region) =>
      api(`/api/media/movies/top_rated?page=${p}${lang ? `&language=${lang}` : ""}${region ? `&region=${region}` : ""}`),
    upcoming: (p = 1, lang, region) =>
      api(`/api/media/movies/upcoming?page=${p}${lang ? `&language=${lang}` : ""}${region ? `&region=${region}` : ""}`),
    details: (id, lang) =>
      api(`/api/media/movies/${id}${lang ? `?language=${lang}` : ""}`),

    // ✅ matches Swagger
    providers: (id, region = USER_REGION) =>
      api(`/api/media/movies/${id}/watch/providers?region=${region}`),
  },
  tv: {
    airingToday: (p = 1, lang, tz) =>
      api(`/api/media/tv/airing_today?page=${p}${lang ? `&language=${lang}` : ""}${tz ? `&timezone=${encodeURIComponent(tz)}` : ""}`),
    onTheAir: (p = 1, lang, tz) =>
      api(`/api/media/tv/on_the_air?page=${p}${lang ? `&language=${lang}` : ""}${tz ? `&timezone=${encodeURIComponent(tz)}` : ""}`),
    popular: (p = 1, lang) =>
      api(`/api/media/tv/popular?page=${p}${lang ? `&language=${lang}` : ""}`),
    topRated: (p = 1, lang) =>
      api(`/api/media/tv/top_rated?page=${p}${lang ? `&language=${lang}` : ""}`),
    details: (id, lang) =>
      api(`/api/media/tv/${id}${lang ? `?language=${lang}` : ""}`),

    // conventionally mirrors movies
    providers: (id, region = USER_REGION) =>
      api(`/api/media/tv/${id}/watch/providers?region=${region}`),
  },
  search: {
    multi: (q, page = 1, includeAdult = false, lang) =>
      api(`/api/media/search/multi?query=${encodeURIComponent(q)}&page=${page}&includeAdult=${includeAdult}${lang ? `&language=${lang}` : ""}`),
  },
};
