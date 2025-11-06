import { useEffect, useState } from "react";

// Same storage key as Watchlist.jsx so they share data
const STORAGE_KEY = "watchlist.v1";

const TYPE_LABELS = {
  Scripted: "TV Show",
  Animation: "Animated Series",
  Reality: "Reality Show",
  "Talk Show": "Talk Show",
  "Game Show": "Game Show",
};

export default function MoviesShows() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

   // NEW: front-end filter state
  // ---- FILTER + SORT STATE (front end only) ----
  const [typeFilter, setTypeFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [minRating, setMinRating] = useState("");
  const [minRuntime, setMinRuntime] = useState("");
  const [maxRuntime, setMaxRuntime] = useState("");
  const [sortBy, setSortBy] = useState("relevance");


  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => search(q), 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function search(term) {
    const s = term.trim();
    if (!s) { setResults([]); return; }
    setBusy(true);
    try {
      const res = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(s)}`);
      const data = await res.json();
     const normalized = (data || []).map((x) => {
  const show = x.show;

  return {
    id: show.id,
    title: show.name,
    poster: show.image?.medium || show.image?.original || "",
    year: show.premiered?.slice(0, 4) || "",
    type: show.type || "Show",

    // existing filters
    genres: show.genres || [],
    rating: show.rating?.average ?? null,

    // NEW fields for filters
    runtime: show.runtime ?? show.averageRuntime ?? null,          // length in minutes
    language: show.language || "",                                 // e.g. "English"
    status: show.status || "",                                     // e.g. "Running", "Ended"
    service: show.network?.name || show.webChannel?.name || "",    // network / streaming
  };
});
      setResults(normalized);
    } catch {
      setResults([]);
      toast("Could not fetch results");
    } finally {
      setBusy(false);
    }
  }

  function toast(text) {
    setMsg(text);
    setTimeout(() => setMsg(""), 1500);
  }

  function readWatchlist() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  }

  function writeWatchlist(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function addToWatchlist(item) {
    const current = readWatchlist();
    const exists = current.some(
      x => x.id === item.id || x.title.toLowerCase() === item.title.toLowerCase()
    );
    if (exists) {
      toast("Already in your watchlist");
      return;
    }
    const next = [{ ...item }, ...current];
    writeWatchlist(next);
    toast("Added to watchlist");
  }

   // NEW: apply filter on the front end only
   const filteredResults = results.filter(r => {
  if (typeFilter !== "all" && r.type !== typeFilter) return false;
  if (genreFilter !== "all" && !r.genres.includes(genreFilter)) return false;

  if (languageFilter !== "all" && r.language !== languageFilter) return false;
  if (statusFilter !== "all" && r.status !== statusFilter) return false;
  if (serviceFilter !== "all" && r.service !== serviceFilter) return false;

  if (minYear && r.year && Number(r.year) < Number(minYear)) return false;
  if (maxYear && r.year && Number(r.year) > Number(maxYear)) return false;

  if (minRating && r.rating != null && r.rating < Number(minRating)) return false;

  if (minRuntime && r.runtime != null && r.runtime < Number(minRuntime)) return false;
  if (maxRuntime && r.runtime != null && r.runtime > Number(maxRuntime)) return false;

  return true;
});
  const visibleResults = [...filteredResults].sort((a, b) => {
    if (sortBy === "rating") {
      return (b.rating ?? 0) - (a.rating ?? 0);
    }
    if (sortBy === "year") {
      return (Number(b.year) || 0) - (Number(a.year) || 0);
    }
    // "relevance" – keep original TVMaze order
    return 0;
  });

  //build dynamic dropdown options from current results
  const typeOptions = Array.from(new Set(results.map(r => r.type))).sort();
  const genreOptions = Array.from(
    new Set(results.flatMap(r => r.genres || []))
  ).sort();
  const languageOptions = Array.from(
  new Set(results.map(r => r.language).filter(Boolean))
).sort();

const statusOptions = Array.from(
  new Set(results.map(r => r.status).filter(Boolean))
).sort();

const serviceOptions = Array.from(
  new Set(results.map(r => r.service).filter(Boolean))
).sort();

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Browse Movies & Shows</h1>
        {msg && (
          <span className="text-sm px-3 py-1 rounded-full bg-white/10 text-white">
            {msg}
          </span>
        )}
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

  {/* NEW: Filters (front end only) */}
  <div className="flex flex-wrap gap-3 mt-1 text-sm items-end">
    {/* Type filter */}
    <label className="flex items-center gap-2 text-slate-200">
      <span>Type:</span>
      <select
        className="bg-white/10 text-white border border-white/20 rounded-md px-2 py-1"
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
      >
        <option value="all">All</option>
        {/* dynamic options */}
        {typeOptions.map(t => (
          <option key={t} value={t}>
            {TYPE_LABELS[t] || t}
            </option>
        ))}
      </select>
    </label>

    {/* Genre filter */}
    <label className="flex items-center gap-2 text-slate-200">
    <span>Genre:</span>
    <select
      className="bg-white/10 text-white border border-white/20 rounded-md px-2 py-1"
      value={genreFilter}
      onChange={(e) => setGenreFilter(e.target.value)}
    >
    <option value="all">All</option>
  {genreOptions.map(g => (
  <option key={g} value={g}>{g}</option>
))}
  </select>
</label>

    {/* Year range */}
    <div className="flex items-center gap-2 text-slate-200">
      <span>Year:</span>
      <input
        type="number"
        placeholder="From"
        className="w-20 bg-white/10 text-white border border-white/20 rounded-md px-2 py-1"
        value={minYear}
        onChange={(e) => setMinYear(e.target.value)}
      />
      <span>–</span>
      <input
        type="number"
        placeholder="To"
        className="w-20 bg-white/10 text-white border border-white/20 rounded-md px-2 py-1"
        value={maxYear}
        onChange={(e) => setMaxYear(e.target.value)}
      />
    </div>

    {/* Min rating */}
    <div className="flex items-center gap-2 text-slate-200">
      <span>Min rating:</span>
      <input
        type="number"
        min="0"
        max="10"
        step="0.5"
        className="w-16 bg-white/10 text-white border border-white/20 rounded-md px-2 py-1"
        value={minRating}
        onChange={(e) => setMinRating(e.target.value)}
      />
    </div>

    {/* Runtime range */}
    <div className="flex items-center gap-2 text-slate-200">
    <span>Runtime (min):</span>
    <input
    type="number"
    placeholder="From"
    className="w-20 bg-white/10 text-white border border-white/20 rounded-md px-2 py-1"
    value={minRuntime}
    onChange={(e) => setMinRuntime(e.target.value)}
    />
  <span>–</span>
  <input
  type="number"
  placeholder="To"
  className="w-20 bg-white/10 text-white border border-white/20 rounded-md px-2 py-1"
  value={maxRuntime}
  onChange={(e) => setMaxRuntime(e.target.value)}
/>
</div>

{/* Language */}
<label className="flex items-center gap-2 text-slate-200">
<span>Language:</span>
<select
className="bg-white/10 text-white border border-white/20 rounded-md px-2 py-1"
value={languageFilter}
onChange={(e) => setLanguageFilter(e.target.value)}
>
<option value="all">All</option>
{languageOptions.map(l => (
  <option key={l} value={l}>{l}</option>
))}
</select>
</label>

{/* Status */}
<label className="flex items-center gap-2 text-slate-200">
  <span>Status:</span>
  <select
    className="bg-white/10 text-white border border-white/20 rounded-md px-2 py-1"
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    <option value="all">All</option>
    {statusOptions.map(s => (
      <option key={s} value={s}>{s}</option>
    ))}
  </select>
</label>

{/* Streaming service */}
<label className="flex items-center gap-2 text-slate-200">
  <span>Service:</span>
  <select
    className="bg-white/10 text-white border border-white/20 rounded-md px-2 py-1"
    value={serviceFilter}
    onChange={(e) => setServiceFilter(e.target.value)}
  >
    <option value="all">All</option>
    {serviceOptions.map(s => (
      <option key={s} value={s}>{s}</option>
    ))}
  </select>
</label>

  {/* Sort by */}
  <label className="flex items-center gap-2 text-slate-200">
        <span>Sort by:</span>
        <select
          className="bg-white/10 text-white border border-white/20 rounded-md px-2 py-1"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="relevance">Relevance</option>
          <option value="rating">Rating</option>
          <option value="year">Year</option>
        </select>
      </label>

  {/* Clear all filters */}
  {(typeFilter !== "all" ||
    genreFilter !== "all" ||
    minYear ||
    maxYear ||
    minRating ||
    typeFilter ||
    languageFilter ||
    statusFilter ||
    serviceFilter ||
    minRuntime ||
    maxRuntime ||
    sortBy !== "relevance") && (
    <button
      className="ml-auto px-3 py-2 rounded-md border border-white/20 text-xs text-slate-100 hover:bg-white/10"
      onClick={() => {
        setTypeFilter("all");
        setGenreFilter("all");
        setLanguageFilter("all");
        setStatusFilter("all");
        setServiceFilter("all");
        setMinYear("");
        setMaxYear("");
        setMinRating("");
        setMinRuntime("");
        setMaxRuntime("");
        setSortBy("relevance");
}}
    >
      Clear All
    </button>
  )}
</div>

    {busy && <p className="text-sm text-slate-300">Searching…</p>}

  {/* Results grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* use visibleResults instead of raw results */}
    {visibleResults.map(r => (
      <article
        key={r.id}
        className="bg-white/5 border border-white/10 rounded-lg overflow-hidden"
      >
        <div className="flex gap-3 p-3">
          {r.poster ? (
            <img
              src={r.poster}
              alt=""
              className="w-20 h-28 object-cover rounded"
              loading="lazy"
            />
          ) : (
            <div className="w-20 h-28 bg-white/10 rounded" />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-white">{r.title}</h3>
            <p className="text-xs text-slate-300">
            {TYPE_LABELS[r.type] || r.type}
            {r.year && ` • ${r.year}`}
            {r.rating != null && ` • ⭐ ${r.rating}`}
            {r.runtime != null && ` • ${r.runtime} min`}
            {r.language && ` • ${r.language}`}
            {r.service && ` • ${r.service}`}
            </p>
            <button
              className="mt-3 px-3 py-1 text-sm rounded-md bg-teal-500 text-white hover:bg-teal-400"
              onClick={() => addToWatchlist(r)}
            >
              Add to Watchlist
            </button>
          </div>
        </div>
      </article>
    ))}
  </div>

  {/* Empty state */}
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
</div>
);
}
