// src/utils/watchLabel.js
import { media, USER_REGION, normalizeProviders } from "./api";

export function getPrimaryWatchLabel(providers, type, item) {
  const rel = type === "movie" ? item?.release_date : item?.first_air_date;
  if (rel && new Date(rel) > new Date()) return `Opens ${rel}`;
  const sub = providers?.flatrate?.[0] || providers?.ads?.[0] || providers?.free?.[0];
  if (sub) return sub;
  if ((providers?.rent?.length || 0) + (providers?.buy?.length || 0) > 0) return "Rent/Buy";
  if (rel) return (rel || "").slice(0, 4);
  return "";
}

export async function fetchPrimaryLabel(type, id, item) {
  try {
    const raw = type === "movie"
      ? await media.movies.providers(id, USER_REGION)
      : await media.tv.providers(id, USER_REGION);
    const norm = normalizeProviders(raw?.results ?? raw, USER_REGION);
    return getPrimaryWatchLabel(norm, type, item);
  } catch {
    return "";
  }
}
