// src/pages/MoviesShows.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { media, tmdbImg } from "../utils/api.js";
import { fetchPrimaryLabel } from "../utils/watchLabel";

// Local watchlist storage key
const STORAGE_KEY = "watchlist.v1";

// For friendly display of "type"
const TYPE_LABELS = {
  Scripted: "TV Show",
  Animation: "Animated Series",
  Reality: "Reality Show",
  "Talk Show": "Talk Show",
  "Game Show": "Game Show",
  Movie: "Movie",
};

// TMDB genre id → label
const GENRE_LABELS = {
  "28": "Action",
  "12": "Adventure",
  "16": "Animation",
  "35": "Comedy",
  "80": "Crime",
  "99": "Documentary",
  "18": "Drama",
  "10751": "Family",
  "14": "Fantasy",
  "36": "History",
  "27": "Horror",
  "10402": "Music",
  "9648": "Mystery",
  "10749": "Romance",
  "878": "Science Fiction",
  "10770": "TV Movie",
  "53": "Thriller",
  "10752": "War",
  "37": "Western",
  "10759": "Action & Adventure",
  "10765": "Sci-Fi & Fantasy",
  "10766": "Soap",
};

const LANGUAGE_LABELS = {
  EN: "English",
  FR: "French",
  ES: "Spanish",
  DE: "German",
  IT: "Italian",
  JA: "Japanese",
  KO: "Korean",
  ZH: "Chinese",
  HI: "Hindi",
  PT: "Portuguese",
  RU: "Russian",
};

const STATUS_LABELS = {
  "Returning Series": "Currently Airing",
  Ended: "Ended",
  Canceled: "Canceled",
  "In Production": "In production",
  Planned: "Planned",
  Pilot: "Pilot",
  Released: "Released",
};

const PROVIDER_REGION = "US";

/* ----------------------------------------------------------
   Reusable multi-select dropdown with checkmarks
---------------------------------------------------------- */
function MultiSelectDropdown({ placeholder, options, selected, onChange }) {
  const [open, setOpen] = useState(false);

  function toggleOption(value) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  const label =
    selected.length === 0
      ? placeholder
      : selected.length === 1
      ? options.find((o) => o.value === selected[0])?.label ?? selected[0]
      : `${selected.length} selected`;

  return (
    <div className="relative text-xs">
      <button
        type="button"
        className="flex items-center justify-between gap-2 min-w-[150px] bg-slate-900/80 border border-slate-600 rounded-md px-3 py-2 text-slate-100 hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-600"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="truncate">{label}</span>
        <span className="text-[10px] text-slate-400">▼</span>
      </button>

      {open && (
        <div className="absolute z-20 mt-1 w-full max-h-52 overflow-auto bg-slate-950/95 border border-slate-700 rounded-md shadow-lg">
          {options.length === 0 && (
            <div className="px-3 py-2 text-[11px] text-slate-400">No options</div>
          )}
          {options.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-slate-800/80 text-[11px] text-slate-100"
            >
              <input
                type="checkbox"
                className="accent-teal-400"
                checked={selected.includes(opt.value)}
                onChange={() => toggleOption(opt.value)}
              />
              <span className="truncate">{opt.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------
   Poster with ribbon
---------------------------------------------------------- */
function PosterWithRibbon({ poster, mediaType, id, item }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!mediaType || !id) return;
    fetchPrimaryLabel(mediaType, id, item ?? {}).then(setLabel);
  }, [mediaType, id, item?.release_date, item?.first_air_date]);

  return (
    <div className="relative w-20 h-28">
      {poster ? (
        <img
          src={poster}
          alt=""
          className="w-full h-full object-cover rounded"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full bg-white/10 rounded" />
      )}
      {label && (
        <div className="absolute left-1 top-1 px-1.5 py-0.5 text-[10px] rounded bg-black/70 border border-white/15 font-semibold">
          {label}
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------
   Helper: fetch streaming services for one title
---------------------------------------------------------- */
async function fetchWatchProviders(mediaType, tmdbId) {
  try {
    const raw =
      mediaType === "movie"
        ? await media.movies.providers(tmdbId, PROVIDER_REGION)
        : await media.tv.providers(tmdbId, PROVIDER_REGION);

    const regionBlock = raw?.results?.[PROVIDER_REGION] || {};
    const GROUPS = ["flatrate", "free", "ads", "rent", "buy"];

    const allNames = GROUPS.flatMap((g) =>
      (regionBlock[g] || []).map(
        (p) => p.provider_name || p.provider_id || p.name
      )
    );

    return Array.from(new Set(allNames));
  } catch (err) {
    console.error("fetchWatchProviders error:", err);
    return [];
  }
}

/* ----------------------------------------------------------
   MAIN PAGE COMPONENT
---------------------------------------------------------- */
export default function MoviesShows() {
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [safeOnly, setSafeOnly] = useState(false); // default: show all

  const PAGE_SIZE = 24;
  const [itemsToShow, setItemsToShow] = useState(PAGE_SIZE);
  const [filterMode, setFilterMode] = useState("quick");

  // Filter + sort state
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [minRating, setMinRating] = useState("");
  const [minRuntime, setMinRuntime] = useState("");
  const [maxRuntime, setMaxRuntime] = useState("");
  const [sortBy, setSortBy] = useState("relevance");

  const [includeTypes, setIncludeTypes] = useState([]);
  const [excludeTypes, setExcludeTypes] = useState([]);

  const [includeGenres, setIncludeGenres] = useState([]);
  const [excludeGenres, setExcludeGenres] = useState([]);

  const [includeLanguages, setIncludeLanguages] = useState([]);
  const [excludeLanguages, setExcludeLanguages] = useState([]);

  const [includeStatuses, setIncludeStatuses] = useState([]);
  const [excludeStatuses, setExcludeStatuses] = useState([]);

  const [includeServices, setIncludeServices] = useState([]);
  const [excludeServices, setExcludeServices] = useState([]);

  /* ----------------------------
     helper to attach TV status
  ---------------------------- */
  async function attachTvStatus(items) {
    const tvItems = items.filter((i) => i.mediaType === "tv");
    const otherItems = items.filter((i) => i.mediaType !== "tv");

    const tvWithStatus = await Promise.all(
      tvItems.map(async (tv) => {
        try {
          const details = await media.tv.details(tv.id);
          return { ...tv, status: details.status || "" };
        } catch (e) {
          console.error("Could not load TV status for", tv.id, e);
          return tv;
        }
      })
    );

    return [...otherItems, ...tvWithStatus];
  }

  /* ----------------------------
     1) Search / default loading
  ---------------------------- */
  useEffect(() => {
    if (q.trim()) {
      const id = setTimeout(() => {
        search(q);
      }, 300);
      return () => clearTimeout(id);
    }

    // when q is empty -> load default popular titles
    loadDefaultShows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, safeOnly]); // safeOnly also refetches

  // Reset how many cards we show whenever filters / query change
  useEffect(() => {
    setItemsToShow(PAGE_SIZE);
  }, [
    q,
    includeTypes,
    excludeTypes,
    includeGenres,
    excludeGenres,
    includeServices,
    excludeServices,
    includeLanguages,
    excludeLanguages,
    includeStatuses,
    excludeStatuses,
    minYear,
    maxYear,
    minRating,
    minRuntime,
    maxRuntime,
    sortBy,
    safeOnly,
  ]);

  /* ----------------------------
     Default popular titles
  ---------------------------- */
  async function loadDefaultShows() {
    setBusy(true);
    try {
      const [mpop, tvpop] = await Promise.all([
        media.movies.popular(1),
        media.tv.popular(1),
      ]);

      const moviePromises = (mpop?.results || []).map(async (m) => {
        const services = await fetchWatchProviders("movie", m.id);

        return {
          id: m.id,
          mediaType: "movie",
          title: m.title || m.original_title,
          poster: tmdbImg(m.poster_path),
          year: (m.release_date || "").slice(0, 4),
          type: "Movie",
          genres: (m.genre_ids || []).map(String),
          rating: m.vote_average ?? null,
          runtime: null,
          language: m.original_language?.toUpperCase(),
          status: "",
          service: services, // array of provider names
          release_date: m.release_date,
          adult: !!m.adult,
        };
      });

      const tvPromises = (tvpop?.results || []).map(async (t) => {
        const services = await fetchWatchProviders("tv", t.id);

        return {
          id: t.id,
          mediaType: "tv",
          title: t.name || t.original_name,
          poster: tmdbImg(t.poster_path),
          year: (t.first_air_date || "").slice(0, 4),
          type: "Scripted",
          genres: (t.genre_ids || []).map(String),
          rating: t.vote_average ?? null,
          runtime: t.episode_run_time?.[0] ?? null,
          language: t.original_language?.toUpperCase(),
          status: "",
          service: services, // array of provider names
          first_air_date: t.first_air_date,
          adult: !!t.adult,
        };
      });

      const normalizedMovies = await Promise.all(moviePromises);
      const normalizedTv = await Promise.all(tvPromises);

      const withStatus = await attachTvStatus([
        ...normalizedMovies,
        ...normalizedTv,
      ]);

      setResults(withStatus);
    } catch (err) {
      console.error(err);
      toast("Could not load default titles");
    } finally {
      setBusy(false);
    }
  }

  /* ----------------------------
     Search TMDB via backend
  ---------------------------- */
  async function search(term) {
    const s = term.trim();
    if (!s) {
      setResults([]);
      return;
    }

    setBusy(true);
    try {
      const data = await media.search.multi(s, 1, false);

      const raw = (data?.results || []).filter(
        (x) => x.media_type === "movie" || x.media_type === "tv"
      );

      const mapped = await Promise.all(
        raw.map(async (x) => {
          if (x.media_type === "movie") {
            const services = await fetchWatchProviders("movie", x.id);
            return {
              id: x.id,
              mediaType: "movie",
              title: x.title || x.original_title,
              poster: tmdbImg(x.poster_path),
              year: (x.release_date || "").slice(0, 4),
              type: "Movie",
              genres: (x.genre_ids || []).map(String),
              rating: x.vote_average ?? null,
              runtime: null,
              language: x.original_language?.toUpperCase(),
              status: "",
              service: services,
              release_date: x.release_date,
              adult: !!x.adult,
            };
          }

          // TV
          const services = await fetchWatchProviders("tv", x.id);
          return {
            id: x.id,
            mediaType: "tv",
            title: x.name || x.original_name,
            poster: tmdbImg(x.poster_path),
            year: (x.first_air_date || "").slice(0, 4),
            type: "Scripted",
            genres: (x.genre_ids || []).map(String),
            rating: x.vote_average ?? null,
            runtime: x.episode_run_time?.[0] ?? null,
            language: x.original_language?.toUpperCase(),
            status: "",
            service: services,
            first_air_date: x.first_air_date,
            adult: !!x.adult,
          };
        })
      );

      const withStatus = await attachTvStatus(mapped);
      setResults(withStatus);
    } catch (e) {
      console.error(e);
      setResults([]);
      toast("Could not fetch results");
    } finally {
      setBusy(false);
    }
  }

  /* ----------------------------
     Toast + watchlist helpers
  ---------------------------- */
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

  function addToWatchlist(item) {
    const current = readWatchlist();
    const exists = current.some(
      (x) =>
        x.id === item.id ||
        x.title.toLowerCase() === item.title.toLowerCase()
    );
    if (exists) {
      toast("Already in your watchlist");
      return;
    }
    const next = [{ ...item }, ...current];
    writeWatchlist(next);
    toast("Added to watchlist");
  }

  /* ----------------------------
     FRONT-END FILTERING
  ---------------------------- */
  const filteredResults = results.filter((r) => {
    // SAFE ONLY: hide adult titles when toggle is ON
    if (safeOnly && r.adult) return false;

    // TYPE
    if (includeTypes.length > 0 && !includeTypes.includes(r.type)) return false;
    if (excludeTypes.length > 0 && excludeTypes.includes(r.type)) return false;

    // GENRES (ids stored as strings)
    if (
      includeGenres.length > 0 &&
      !includeGenres.some((g) => (r.genres || []).includes(g))
    )
      return false;

    if (
      excludeGenres.length > 0 &&
      excludeGenres.some((g) => (r.genres || []).includes(g))
    )
      return false;

    // SERVICES – r.service is an array of names
    if (
      includeServices.length > 0 &&
      !includeServices.some((s) => (r.service || []).includes(s))
    )
      return false;

    if (
      excludeServices.length > 0 &&
      excludeServices.some((s) => (r.service || []).includes(s))
    )
      return false;

    // LANGUAGE
    if (
      includeLanguages.length > 0 &&
      !includeLanguages.includes(r.language)
    )
      return false;

    if (
      excludeLanguages.length > 0 &&
      excludeLanguages.includes(r.language)
    )
      return false;

    // STATUS
    if (includeStatuses.length > 0 && !includeStatuses.includes(r.status))
      return false;

    if (excludeStatuses.length > 0 && excludeStatuses.includes(r.status))
      return false;

    // NUMERIC FILTERS
    if (minYear && r.year && Number(r.year) < Number(minYear)) return false;
    if (maxYear && r.year && Number(r.year) > Number(maxYear)) return false;

    if (minRating && r.rating != null && r.rating < Number(minRating))
      return false;

    if (minRuntime && r.runtime != null && r.runtime < Number(minRuntime))
      return false;

    if (maxRuntime && r.runtime != null && r.runtime > Number(maxRuntime))
      return false;

    return true;
  });

  const visibleResults = [...filteredResults].sort((a, b) => {
    if (sortBy === "rating") {
      return (b.rating ?? 0) - (a.rating ?? 0);
    }
    if (sortBy === "year") {
      return (Number(b.year) || 0) - (Number(a.year) || 0);
    }
    // relevance – keep API order
    return 0;
  });

  const limitedResults = visibleResults.slice(0, itemsToShow);

  /* ----------------------------
     Dynamic dropdown options
  ---------------------------- */
  const typeOptions = Array.from(new Set(results.map((r) => r.type))).sort();

  const genreOptions = Array.from(
    new Set(results.flatMap((r) => r.genres || []))
  ).sort((a, b) => {
    const la = GENRE_LABELS[a] || a;
    const lb = GENRE_LABELS[b] || b;
    return la.localeCompare(lb);
  });

// Always include our predefined languages, plus any extra codes from results
const languageOptions = Array.from(
  new Set([
    ...Object.keys(LANGUAGE_LABELS),                        // EN, FR, ES, etc.
    ...results.map((r) => r.language).filter(Boolean),      // any others from TMDB
  ])
).sort((a, b) => {
  const la = LANGUAGE_LABELS[a] || a;
  const lb = LANGUAGE_LABELS[b] || b;
  return la.localeCompare(lb);
});


  const statusOptions = Array.from(
    new Set(results.map((r) => r.status).filter(Boolean))
  ).sort();

  const serviceOptions = Array.from(
    new Set(results.flatMap((r) => r.service || []).filter(Boolean))
  ).sort();

  // Quick-mode single value summaries
  const quickTypeValue =
    includeTypes.length === 0 && excludeTypes.length === 0
      ? "all"
      : includeTypes.length === 1 && excludeTypes.length === 0
      ? includeTypes[0]
      : "custom";

  const quickGenreValue =
    includeGenres.length === 0 && excludeGenres.length === 0
      ? "all"
      : includeGenres.length === 1 && excludeGenres.length === 0
      ? includeGenres[0]
      : "custom";

  const quickServiceValue =
    includeServices.length === 0 && excludeServices.length === 0
      ? "all"
      : includeServices.length === 1 && excludeServices.length === 0
      ? includeServices[0]
      : "custom";

  const quickLanguageValue =
    includeLanguages.length === 0 && excludeLanguages.length === 0
      ? "all"
      : includeLanguages.length === 1 && excludeLanguages.length === 0
      ? includeLanguages[0]
      : "custom";

  const quickStatusValue =
    includeStatuses.length === 0 && excludeStatuses.length === 0
      ? "all"
      : includeStatuses.length === 1 && excludeStatuses.length === 0
      ? includeStatuses[0]
      : "custom";

  /* ----------------------------------------------------------
     RENDER
  ---------------------------------------------------------- */
  return (
    <div className="space-y-6">
<header className="flex items-center justify-between gap-3">
  <h1 className="text-3xl font-bold">Browse Movies &amp; Shows</h1>
</header>


      {/* Search bar */}
      <div className="flex gap-2">
        <input
          className="border rounded-md px-3 py-2 flex-1 bg-white/90 text-gray-900"
          placeholder="Search (e.g., The Office, Dune, Friends)…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q && (
          <button
            className="px-3 py-2 text-sm rounded-md bg-white/10 text-white hover:bg-white/20"
            onClick={() => setQ("")}
          >
            Clear
          </button>
        )}
      </div>

      {/* Filters panel */}
      <div className="mt-4 space-y-4 text-sm">
        {/* Header row with Quick/Advanced toggle + Safe toggle */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-slate-100">
              Filter results
            </h2>

            {/* Quick / Advanced switch */}
            <div className="flex items-center text-[11px] bg-slate-900/60 rounded-full border border-white/10 overflow-hidden">
              <button
                type="button"
                onClick={() => setFilterMode("quick")}
                className={`px-3 py-1 ${
                  filterMode === "quick"
                    ? "bg-cyan-400 text-slate-900"
                    : "bg-transparent text-slate-300"
                }`}
              >
                Quick
              </button>
              <button
                type="button"
                onClick={() => setFilterMode("advanced")}
                className={`px-3 py-1 ${
                  filterMode === "advanced"
                    ? "bg-cyan-400 text-slate-900"
                    : "bg-transparent text-slate-300"
                }`}
              >
                Advanced
              </button>
            </div>

           {/* Safe mode toggle */}
<label className="flex items-center gap-3 ml-3">
  <div className="flex flex-col leading-tight">
    <span className="text-[11px] font-semibold text-slate-100">
      Safe mode
    </span>
    <span className="text-[10px] text-slate-400">
      {safeOnly ? "Family-friendly only" : "All titles"}
    </span>
  </div>

  <button
    type="button"
    onClick={() => setSafeOnly((prev) => !prev)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full border transition-colors
      ${safeOnly ? "bg-cyan-500 border-cyan-400" : "bg-slate-800 border-slate-500"}
    `}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
        ${safeOnly ? "translate-x-4" : "translate-x-0"}
      `}
    />
  </button>
</label>

          </div>

          {/* Clear all filters */}
          {(includeTypes.length ||
            excludeTypes.length ||
            includeGenres.length ||
            excludeGenres.length ||
            includeServices.length ||
            excludeServices.length ||
            includeLanguages.length ||
            excludeLanguages.length ||
            includeStatuses.length ||
            excludeStatuses.length ||
            minYear ||
            maxYear ||
            minRating ||
            minRuntime ||
            maxRuntime ||
            sortBy !== "relevance") && (
            <button
              className="px-3 py-1.5 rounded-md border border-white/20 text-xs text-slate-100 hover:bg-white/10"
              onClick={() => {
                setIncludeTypes([]);
                setExcludeTypes([]);
                setIncludeGenres([]);
                setExcludeGenres([]);
                setIncludeServices([]);
                setExcludeServices([]);
                setIncludeLanguages([]);
                setExcludeLanguages([]);
                setIncludeStatuses([]);
                setExcludeStatuses([]);
                setMinYear("");
                setMaxYear("");
                setMinRating("");
                setMinRuntime("");
                setMaxRuntime("");
                setSortBy("relevance");
              }}
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* QUICK MODE */}
        {filterMode === "quick" && (
          <div className="flex flex-wrap gap-3 items-end text-xs md:text-sm">
            {/* Type */}
            <label className="flex flex-col gap-1 text-slate-200">
              <span>Type</span>
              <select
                className="min-w-[150px] bg-slate-900/80 border border-slate-600 rounded-md px-3 py-2 text-slate-100"
                value={quickTypeValue}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "all") {
                    setIncludeTypes([]);
                    setExcludeTypes([]);
                  } else if (val === "custom") {
                    // leave advanced combo as-is
                  } else {
                    setIncludeTypes([val]);
                    setExcludeTypes([]);
                  }
                }}
              >
                <option value="all">All types</option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t] || t}
                  </option>
                ))}
                {quickTypeValue === "custom" && (
                  <option value="custom">(custom)</option>
                )}
              </select>
            </label>

            {/* Genre */}
            <label className="flex flex-col gap-1 text-slate-200">
              <span>Genre</span>
              <select
                className="min-w-[150px] bg-slate-900/80 border border-slate-600 rounded-md px-3 py-2 text-slate-100"
                value={quickGenreValue}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "all") {
                    setIncludeGenres([]);
                    setExcludeGenres([]);
                  } else if (val === "custom") {
                    // keep advanced custom
                  } else {
                    setIncludeGenres([val]);
                    setExcludeGenres([]);
                  }
                }}
              >
                <option value="all">All genres</option>
                {genreOptions.map((g) => (
                  <option key={g} value={g}>
                    {GENRE_LABELS[g] || g}
                  </option>
                ))}
                {quickGenreValue === "custom" && (
                  <option value="custom">(custom)</option>
                )}
              </select>
            </label>

            {/* Service */}
            <label className="flex flex-col gap-1 text-slate-200">
              <span>Service</span>
              <select
                className="min-w-[150px] bg-slate-900/80 border border-slate-600 rounded-md px-3 py-2 text-slate-100"
                value={quickServiceValue}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "all") {
                    setIncludeServices([]);
                    setExcludeServices([]);
                  } else if (val === "custom") {
                    // keep advanced custom
                  } else {
                    setIncludeServices([val]);
                    setExcludeServices([]);
                  }
                }}
              >
                <option value="all">All services</option>
                {serviceOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
                {quickServiceValue === "custom" && (
                  <option value="custom">(custom)</option>
                )}
              </select>
            </label>

            {/* Language */}
            <label className="flex flex-col gap-1 text-slate-200">
              <span>Language</span>
              <select
                className="min-w-[130px] bg-slate-900/80 border border-slate-600 rounded-md px-3 py-2 text-slate-100"
                value={quickLanguageValue}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "all") {
                    setIncludeLanguages([]);
                    setExcludeLanguages([]);
                  } else if (val === "custom") {
                    // keep advanced custom
                  } else {
                    setIncludeLanguages([val]);
                    setExcludeLanguages([]);
                  }
                }}
              >
                <option value="all">All languages</option>
                {languageOptions.map((code) => (
                  <option key={code} value={code}>
                    {LANGUAGE_LABELS[code] || code}
                  </option>
                ))}
                {quickLanguageValue === "custom" && (
                  <option value="custom">(custom)</option>
                )}
              </select>
            </label>

            {/* Status */}
            <label className="flex flex-col gap-1 text-slate-200">
              <span>Status</span>
              <select
                className="min-w-[130px] bg-slate-900/80 border border-slate-600 rounded-md px-3 py-2 text-slate-100"
                value={quickStatusValue}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "all") {
                    setIncludeStatuses([]);
                    setExcludeStatuses([]);
                  } else if (val === "custom") {
                    // keep advanced custom
                  } else {
                    setIncludeStatuses([val]);
                    setExcludeStatuses([]);
                  }
                }}
              >
                <option value="all">All statuses</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s] || s}
                  </option>
                ))}
                {quickStatusValue === "custom" && (
                  <option value="custom">(custom)</option>
                )}
              </select>
            </label>

            {/* Year + rating + sort */}
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex items-center gap-2 text-slate-200">
                <span>Year:</span>
                <input
                  type="number"
                  placeholder="From"
                  className="w-20 bg-slate-900/80 text-white border border-slate-600 rounded-md px-2 py-1"
                  value={minYear}
                  onChange={(e) => setMinYear(e.target.value)}
                />
                <span>–</span>
                <input
                  type="number"
                  placeholder="To"
                  className="w-20 bg-slate-900/80 text-white border border-slate-600 rounded-md px-2 py-1"
                  value={maxYear}
                  onChange={(e) => setMaxYear(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 text-slate-200">
                <span>Min rating:</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  className="w-16 bg-slate-900/80 text-white border border-slate-600 rounded-md px-2 py-1"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 text-slate-200">
                <span>Sort by:</span>
                <select
                  className="bg-slate-900/80 text-white border border-slate-600 rounded-md px-2 py-1"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="relevance">Relevance</option>
                  <option value="rating">Rating</option>
                  <option value="year">Year</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ADVANCED MODE */}
        {filterMode === "advanced" && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* TYPE */}
              <div className="bg-slate-900/40 rounded-lg border border-white/10 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-100">
                    Type
                  </span>
                  {(includeTypes.length || excludeTypes.length) && (
                    <span className="text-[10px] text-cyan-400">
                      {includeTypes.length ? `+${includeTypes.length}` : ""}
                      {includeTypes.length && excludeTypes.length ? " · " : ""}
                      {excludeTypes.length ? `-${excludeTypes.length}` : ""}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-slate-400 w-14">
                      Include
                    </span>
                    <MultiSelectDropdown
                      placeholder="All types"
                      options={typeOptions.map((t) => ({
                        value: t,
                        label: TYPE_LABELS[t] || t,
                      }))}
                      selected={includeTypes}
                      onChange={setIncludeTypes}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-slate-400 w-14">
                      Exclude
                    </span>
                    <MultiSelectDropdown
                      placeholder="None excluded"
                      options={typeOptions.map((t) => ({
                        value: t,
                        label: TYPE_LABELS[t] || t,
                      }))}
                      selected={excludeTypes}
                      onChange={setExcludeTypes}
                    />
                  </div>
                </div>
              </div>

              {/* GENRES */}
              <div className="bg-slate-900/40 rounded-lg border border-white/10 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-100">
                    Genres
                  </span>
                  {(includeGenres.length || excludeGenres.length) && (
                    <span className="text-[10px] text-cyan-400">
                      {includeGenres.length ? `+${includeGenres.length}` : ""}
                      {includeGenres.length && excludeGenres.length
                        ? " · "
                        : ""}
                      {excludeGenres.length ? `-${excludeGenres.length}` : ""}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-slate-400 w-14">
                      Include
                    </span>
                    <MultiSelectDropdown
                      placeholder="All genres"
                      options={genreOptions.map((g) => ({
                        value: g,
                        label: GENRE_LABELS[g] || g,
                      }))}
                      selected={includeGenres}
                      onChange={setIncludeGenres}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-slate-400 w-14">
                      Exclude
                    </span>
                    <MultiSelectDropdown
                      placeholder="None excluded"
                      options={genreOptions.map((g) => ({
                        value: g,
                        label: GENRE_LABELS[g] || g,
                      }))}
                      selected={excludeGenres}
                      onChange={setExcludeGenres}
                    />
                  </div>
                </div>
              </div>

              {/* SERVICE */}
              <div className="bg-slate-900/40 rounded-lg border border-white/10 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-100">
                    Service
                  </span>
                  {(includeServices.length || excludeServices.length) && (
                    <span className="text-[10px] text-cyan-400">
                      {includeServices.length ? `+${includeServices.length}` : ""}
                      {includeServices.length && excludeServices.length
                        ? " · "
                        : ""}
                      {excludeServices.length
                        ? `-${excludeServices.length}`
                        : ""}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-slate-400 w-14">
                      Include
                    </span>
                    <MultiSelectDropdown
                      placeholder="All services"
                      options={serviceOptions.map((s) => ({
                        value: s,
                        label: s,
                      }))}
                      selected={includeServices}
                      onChange={setIncludeServices}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-slate-400 w-14">
                      Exclude
                    </span>
                    <MultiSelectDropdown
                      placeholder="None excluded"
                      options={serviceOptions.map((s) => ({
                        value: s,
                        label: s,
                      }))}
                      selected={excludeServices}
                      onChange={setExcludeServices}
                    />
                  </div>
                </div>
              </div>

              {/* LANGUAGE */}
              <div className="bg-slate-900/40 rounded-lg border border-white/10 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-100">
                    Language
                  </span>
                  {(includeLanguages.length || excludeLanguages.length) && (
                    <span className="text-[10px] text-cyan-400">
                      {includeLanguages.length
                        ? `+${includeLanguages.length}`
                        : ""}
                      {includeLanguages.length && excludeLanguages.length
                        ? " · "
                        : ""}
                      {excludeLanguages.length
                        ? `-${excludeLanguages.length}`
                        : ""}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-slate-400 w-14">
                      Include
                    </span>
                    <MultiSelectDropdown
                      placeholder="All languages"
                      options={languageOptions.map((code) => ({
                        value: code,
                        label: LANGUAGE_LABELS[code] || code,
                      }))}
                      selected={includeLanguages}
                      onChange={setIncludeLanguages}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-slate-400 w-14">
                      Exclude
                    </span>
                    <MultiSelectDropdown
                      placeholder="None excluded"
                      options={languageOptions.map((code) => ({
                        value: code,
                        label: LANGUAGE_LABELS[code] || code,
                      }))}
                      selected={excludeLanguages}
                      onChange={setExcludeLanguages}
                    />
                  </div>
                </div>
              </div>

              {/* STATUS */}
              <div className="bg-slate-900/40 rounded-lg border border-white/10 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-100">
                    Status
                  </span>
                  {(includeStatuses.length || excludeStatuses.length) && (
                    <span className="text-[10px] text-cyan-400">
                      {includeStatuses.length
                        ? `+${includeStatuses.length}`
                        : ""}
                      {includeStatuses.length && excludeStatuses.length
                        ? " · "
                        : ""}
                      {excludeStatuses.length
                        ? `-${excludeStatuses.length}`
                        : ""}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-slate-400 w-14">
                      Include
                    </span>
                    <MultiSelectDropdown
                      placeholder="All statuses"
                      options={statusOptions.map((s) => ({
                        value: s,
                        label: STATUS_LABELS[s] || s,
                      }))}
                      selected={includeStatuses}
                      onChange={setIncludeStatuses}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase text-slate-400 w-14">
                      Exclude
                    </span>
                    <MultiSelectDropdown
                      placeholder="None excluded"
                      options={statusOptions.map((s) => ({
                        value: s,
                        label: STATUS_LABELS[s] || s,
                      }))}
                      selected={excludeStatuses}
                      onChange={setExcludeStatuses}
                    />
                  </div>
                </div>
              </div>

              {/* OTHER FILTERS (year, rating, runtime, sort) */}
              <div className="bg-slate-900/40 rounded-lg border border-white/10 p-3 space-y-3">
                <span className="text-xs font-semibold text-slate-100">
                  Other filters
                </span>
                <div className="space-y-2 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <span>Year:</span>
                    <input
                      type="number"
                      placeholder="From"
                      className="w-20 bg-slate-900/80 text-white border border-slate-600 rounded-md px-2 py-1"
                      value={minYear}
                      onChange={(e) => setMinYear(e.target.value)}
                    />
                    <span>–</span>
                    <input
                      type="number"
                      placeholder="To"
                      className="w-20 bg-slate-900/80 text-white border border-slate-600 rounded-md px-2 py-1"
                      value={maxYear}
                      onChange={(e) => setMaxYear(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Min rating:</span>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.5"
                      className="w-16 bg-slate-900/80 text-white border border-slate-600 rounded-md px-2 py-1"
                      value={minRating}
                      onChange={(e) => setMinRating(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Runtime (min):</span>
                    <input
                      type="number"
                      placeholder="From"
                      className="w-20 bg-slate-900/80 text-white border border-slate-600 rounded-md px-2 py-1"
                      value={minRuntime}
                      onChange={(e) => setMinRuntime(e.target.value)}
                    />
                    <span>–</span>
                    <input
                      type="number"
                      placeholder="To"
                      className="w-20 bg-slate-900/80 text-white border border-slate-600 rounded-md px-2 py-1"
                      value={maxRuntime}
                      onChange={(e) => setMaxRuntime(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span>Sort by:</span>
                    <select
                      className="bg-slate-900/80 text-white border border-slate-600 rounded-md px-2 py-1"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="relevance">Relevance</option>
                      <option value="rating">Rating</option>
                      <option value="year">Year</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {busy && <p className="text-sm text-slate-300">Searching…</p>}

      {/* Results grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {limitedResults.map((r) => (
          <article
            key={r.id}
            className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition cursor-pointer"
            onClick={() =>
              navigate(`/details/${r.mediaType}/${r.id}`, { state: { show: r } })
            }
          >
            <div className="flex gap-3 p-3">
              <PosterWithRibbon
                poster={r.poster}
                mediaType={r.mediaType}
                id={r.id}
                item={{
                  release_date: r.release_date,
                  first_air_date: r.first_air_date,
                }}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-white">{r.title}</h3>
                <p className="text-xs text-slate-300">
                  {TYPE_LABELS[r.type] || r.type}
                  {r.year && ` • ${r.year}`}
                  {r.rating != null && ` • ⭐ ${r.rating}`}
                  {r.runtime != null && ` • ${r.runtime} min`}
                  {r.language && ` • ${r.language}`}
                </p>
                <button
                  className="mt-3 px-3 py-1 text-sm rounded-md bg-cyan-500 text-white hover:bg-cyan-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToWatchlist(r);
                  }}
                >
                  Add to Watchlist
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {limitedResults.length < visibleResults.length && (
        <div className="mt-4 flex justify-center">
          <button
            className="px-4 py-2 rounded-md bg-white/10 text-white hover:bg-white/20 text-sm"
            onClick={() => setItemsToShow((prev) => prev + PAGE_SIZE)}
          >
            Load more
          </button>
        </div>
      )}

      {/* Empty states */}
      {!busy && results.length > 0 && visibleResults.length === 0 && (
        <div className="text-slate-300">
          No results match these filters. Try changing or clearing them.
        </div>
      )}
      {!busy && results.length === 0 && (
        <div className="text-slate-300">
          Try searching for a title to see results.
        </div>
      )}

            {/* Floating toast popup */}
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
