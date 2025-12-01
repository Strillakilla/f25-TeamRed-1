// src/Pages/Details.jsx
import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { media, tmdbImg, USER_REGION, normalizeProviders } from "../utils/api.js";

const STORAGE_KEY = "watchlist.v1";

// Helper: choose what to show on the poster ribbon
function getPrimaryWatchLabel(providers, type, item) {
  const rel = type === "movie" ? item?.release_date : item?.first_air_date;
  if (rel && new Date(rel) > new Date()) return `Opens ${rel}`;

  const sub =
    providers?.flatrate?.[0] || providers?.ads?.[0] || providers?.free?.[0];
  if (sub) return sub; // Netflix, Hulu, etc.

  if ((providers?.rent?.length || 0) + (providers?.buy?.length || 0) > 0) {
    return "Rent/Buy";
  }

  if (rel) return (rel || "").slice(0, 4);
  return "";
}

export default function Details() {
  const { type, id } = useParams(); // "movie" | "tv"
  const location = useLocation();
  const stateShow = location.state?.show || null;

  const [msg, setMsg] = useState("");

  const [item, setItem] = useState(() => {
    if (!stateShow) return null;
    return {
      ...stateShow,
      poster_full:
        tmdbImg(stateShow.poster_path, "w780") || stateShow.poster_full,
      backdrop_full:
        tmdbImg(stateShow.backdrop_path, "w1280") || stateShow.backdrop_full,
      detailsLoaded: !!stateShow.detailsLoaded,
    };
  });

  const [providers, setProviders] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadDetails() {
      try {
        const data =
          type === "movie"
            ? await media.movies.details(id)
            : await media.tv.details(id);

        if (cancelled) return;
        setItem({
          ...data,
          poster_full: tmdbImg(data.poster_path, "w780"),
          backdrop_full: tmdbImg(data.backdrop_path, "w1280"),
          detailsLoaded: true,
        });
      } catch (e) {
        console.error("[Details] details error:", e);
        if (!cancelled && !stateShow) setErrMsg("Could not load details.");
      }
    }

    async function loadProviders() {
      try {
        const raw =
          type === "movie"
            ? await media.movies.providers(id, USER_REGION)
            : await media.tv.providers(id, USER_REGION);

        if (cancelled) return;
        const norm = normalizeProviders(raw, USER_REGION);
        setProviders(norm);
      } catch (e) {
        console.error("[Details] providers error:", e);
        if (!cancelled)
          setProviders({
            flatrate: [],
            ads: [],
            free: [],
            rent: [],
            buy: [],
            any: [],
          });
      }
    }

    loadDetails();
    loadProviders();

    return () => {
      cancelled = true;
    };
  }, [type, id]); // no need to include stateShow

  // --- toast + watchlist helpers ---

  function toast(text) {
    setMsg(text);
    setTimeout(() => setMsg(""), 1500);
  }

  function readWatchlist() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function writeWatchlist(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function addToWatchlist() {
    if (!item) return;

    const title =
      type === "movie"
        ? item.title || item.original_title
        : item.name || item.original_name;

    const current = readWatchlist();

    const exists = current.some(
      (x) =>
        x.id === item.id ||
        (x.title && x.title.toLowerCase() === title.toLowerCase())
    );
    if (exists) {
      toast("Already in your watchlist");
      return;
    }

    const dateStr =
      type === "movie" ? item.release_date || "" : item.first_air_date || "";
    const year = dateStr.slice(0, 4);

    const watchItem = {
      id: item.id,
      mediaType: type, // "movie" | "tv"
      title,
      poster: tmdbImg(item.poster_path),
      year,
      type: type === "movie" ? "Movie" : "Scripted",
      genres: (item.genres || []).map((g) => String(g.id ?? g)),
      rating: item.vote_average ?? null,
      runtime:
        type === "movie"
          ? item.runtime ?? null
          : Array.isArray(item.episode_run_time)
          ? item.episode_run_time[0] ?? null
          : null,
      language: item.original_language
        ? item.original_language.toUpperCase()
        : "",
      status: type === "tv" ? item.status || "" : "Released",
      service: providers?.any || [],
      release_date: item.release_date,
      first_air_date: item.first_air_date,
      adult: !!item.adult,
    };

    const next = [watchItem, ...current];
    writeWatchlist(next);
    toast("Added to watchlist");
  }

  if (errMsg) {
    return <div className="p-6 text-red-200">Error: {errMsg}</div>;
  }

  if (!item) {
    return <div className="p-6 text-white text-xl">Loading…</div>;
  }

  const title =
    type === "movie"
      ? item.title || item.original_title
      : item.name || item.original_name;
  const summary = (item.overview || "").trim();

  return (
    <div className="p-6 text-white space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Poster with Ribbon */}
        <div className="relative w-64">
          <img
            src={item.poster_full || tmdbImg(item.poster_path)}
            alt={title}
            className="w-64 rounded-lg shadow-lg"
          />
          {providers && (
            <div className="absolute left-2 top-2 px-2 py-1 rounded-md text-xs font-semibold bg-black/70 border border-white/15">
              {getPrimaryWatchLabel(providers, type, item) ||
                (type === "movie" ? "Movie" : "Show")}
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="flex-1 space-y-3">
          <h1 className="text-4xl font-bold">{title}</h1>
          <p className="text-slate-300">
            {summary || "No summary available."}
          </p>

          {type === "movie" ? (
            <>
              <p>
                <strong>Release:</strong> {item.release_date || "—"}
              </p>
              <p>
                <strong>Rating:</strong> {item.vote_average ?? "—"}
              </p>
              <p>
                <strong>Runtime:</strong>{" "}
                {item.runtime != null ? `${item.runtime} min` : "—"}
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>First Air:</strong> {item.first_air_date || "—"}
              </p>
              <p>
                <strong>Rating:</strong> {item.vote_average ?? "—"}
              </p>
              <p>
                <strong>Episodes:</strong> {item.number_of_episodes ?? "—"}
              </p>
              <p>
                <strong>Seasons:</strong> {item.number_of_seasons ?? "—"}
              </p>
              <p>
                <strong>Status:</strong> {item.status || "—"}
              </p>
            </>
          )}

          <p>
            <strong>Genres:</strong>{" "}
            {(item.genres || []).map((g) => g.name).join(", ") || "—"}
          </p>
          <p>
            <strong>Language:</strong>{" "}
            {item.original_language
              ? item.original_language.toUpperCase()
              : "—"}
          </p>

          {/* Add to Watchlist button */}
          <button
            type="button"
            onClick={addToWatchlist}
            className="mt-2 inline-flex items-center px-4 py-2 rounded-md bg-cyan-500 text-white text-sm font-medium hover:bg-cyan-600"
          >
            Add to Watchlist
          </button>
        </div>
      </div>

      {/* Where to Watch Section */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-4">
        <h2 className="text-xl font-semibold mb-2">
          Where to watch (Region: {USER_REGION})
        </h2>
        {!providers ? (
          <p className="text-slate-300">Loading availability…</p>
        ) : (providers.any?.length ?? 0) === 0 ? (
          <p className="text-slate-300">No streaming information available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <ProviderRow label="Subscription" list={providers.flatrate} />
            <ProviderRow label="With Ads" list={providers.ads} />
            <ProviderRow label="Free" list={providers.free} />
            <ProviderRow label="Rent" list={providers.rent} />
            <ProviderRow label="Buy" list={providers.buy} />
          </div>
        )}
      </section>

      {/* Floating toast for watchlist messages */}
      {msg && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="rounded-lg bg-slate-900/95 text-white px-4 py-2 shadow-lg border border-white/15 text-sm">
            {msg}
          </div>
        </div>
      )}
    </div>
  );
}

function ProviderRow({ label, list }) {
  return (
    <div>
      <div className="text-slate-300 mb-1">{label}</div>
      {!list || list.length === 0 ? (
        <div className="text-slate-500">—</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {list.map((name) => (
            <span
              key={name}
              className="px-2 py-1 rounded-full bg-white/10 border border-white/10"
              title={name}
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
