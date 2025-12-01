// src/Pages/Watchlist.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "watchlist.v1";
const CW_KEY = "bb.continue.v1";

function readContinue() {
  try {
    return JSON.parse(localStorage.getItem(CW_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeContinue(items) {
  localStorage.setItem(CW_KEY, JSON.stringify(items));
}

export default function Watchlist() {
  const navigate = useNavigate();

  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const remove = (id) =>
    setItems((prev) => prev.filter((x) => x.id !== id));

  // 🔹 NEW: updateWatchState that also syncs "Continue Watching" on Home
  function updateWatchState(id, newState) {
    setItems((prev) => {
      const updated = prev.map((it) =>
        it.id === id ? { ...it, watchState: newState } : it
      );

      const target = updated.find((it) => it.id === id);
      if (target) {
        let cw = readContinue();
        const idx = cw.findIndex((c) => c.id === target.id);

        if (newState === "watching") {
          // Infer mediaType/kind in the same way Home expects
          const mediaType =
            target.mediaType ||
            (target.type === "Movie" ? "movie" : "tv");

          const kind = mediaType === "movie" ? "movie" : "show";

          const payload = {
            id: target.id,
            mediaType,
            kind,
            title: target.title,
            poster: target.poster,
            year: target.year,
            progress: target.progress ?? 0,
            lastWatchedAt: new Date().toISOString(),
            release_date: target.release_date || "",
            first_air_date: target.first_air_date || "",
          };

          if (idx >= 0) {
            cw[idx] = { ...cw[idx], ...payload };
          } else {
            cw = [payload, ...cw];
          }
        } else {
          // Any state other than "watching" → remove from Continue Watching
          if (idx >= 0) {
            cw.splice(idx, 1);
          }
        }

        writeContinue(cw);
      }

      return updated;
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Watchlist</h1>

      {items.length === 0 ? (
        <div className="border border-white/20 rounded-xl p-6 text-center text-slate-300 bg-white/5">
          Your watchlist is empty. Browse Movies & Shows to add items.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((it) => (
            <article
              key={it.id}
              className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:bg-white/10 transition cursor-pointer"
              onClick={() =>
                navigate(
                  `/details/${it.mediaType || (it.type === "Movie" ? "movie" : "tv")}/${it.id}`,
                  { state: { show: it } }
                )
              }
            >
              {/* Poster */}
              <div className="w-full h-64 bg-white/10 flex items-center justify-center overflow-hidden">
                {it.poster ? (
                  <img
                    src={it.poster}
                    alt={it.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-slate-400">No Image</span>
                )}
              </div>

              {/* Info */}
              <div className="p-3 space-y-1">
                <h3 className="font-semibold text-white">{it.title}</h3>
                <p className="text-xs text-slate-400">
                  {it.year && `${it.year} • `}
                  {it.rating ? `⭐ ${it.rating}` : ""}
                </p>

                {/* Watch state badge + dropdown */}
                <div
                  className="mt-2 flex items-center justify-between gap-2"
                  onClick={(e) => e.stopPropagation()} // Prevent navigation
                >
                  <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-cyan-200">
                    {it.watchState === "watching"
                      ? "Currently watching"
                      : it.watchState === "watched"
                      ? "Already watched"
                      : "Planning to watch"}
                  </span>

                  <select
                    className="text-[10px] bg-slate-900/70 text-slate-100 border border-white/20 rounded-md px-2 py-1"
                    value={it.watchState || "planning"}
                    onChange={(e) => updateWatchState(it.id, e.target.value)}
                  >
                    <option value="planning">Planning to watch</option>
                    <option value="watching">Currently watching</option>
                    <option value="watched">Already watched</option>
                  </select>
                </div>

                <button
                  className="mt-2 px-3 py-1 rounded-md bg-red-600 text-white text-xs hover:bg-red-500"
                  onClick={(e) => {
                    e.stopPropagation(); // stops navigating to details
                    remove(it.id);
                  }}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
