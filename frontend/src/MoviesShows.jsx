import { useEffect, useState } from "react";

// Same storage key as Watchlist.jsx so they share data
const STORAGE_KEY = "watchlist.v1";

export default function MoviesShows() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

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
      const normalized = (data || []).map(x => ({
        id: x.show.id,
        title: x.show.name,
        poster: x.show.image?.medium || x.show.image?.original || "",
        year: x.show.premiered?.slice(0, 4) || "",
        type: x.show.type || "Show",
      }));
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

      {busy && <p className="text-sm text-slate-300">Searching…</p>}

      {/* Results grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map(r => (
          <article key={r.id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <div className="flex gap-3 p-3">
              {r.poster ? (
                <img src={r.poster} alt="" className="w-20 h-28 object-cover rounded" loading="lazy" />
              ) : (
                <div className="w-20 h-28 bg-white/10 rounded" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-white">{r.title}</h3>
                <p className="text-xs text-slate-300">{r.type} {r.year && `• ${r.year}`}</p>
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
      {!busy && results.length === 0 && (
        <div className="text-slate-300">
          Try searching for a title to see results.
        </div>
      )}
    </div>
  );
}
