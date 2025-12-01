// src/Pages/Home.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { media, tmdbImg } from "../utils/api.js";
import { fetchPrimaryLabel } from "../utils/watchLabel";

const CW_KEY = "bb.continue.v1";
const WATCHLIST_KEY = "watchlist.v1";

/* ----------------------------------------------
   Watchlist helper
---------------------------------------------- */
function useWatchlist() {
  try {
    return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]");
  } catch {
    return [];
  }
}

/* ----------------------------------------------
    MAIN COMPONENT
---------------------------------------------- */
export default function Home() {
  const navigate = useNavigate();

  /* ----------------------------
     LOAD WATCHLIST + CONTINUE
  ---------------------------- */
  const watchlist = useWatchlist();

  const [continueItems, setContinueItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CW_KEY) || "[]");
    } catch {
      return [];
    }
  });

  /* ----------------------------------------------
     Enrich legacy CW entries
  ---------------------------------------------- */
useEffect(() => {
  let cancelled = false;

  async function migrateCW() {
    // already migrated? bail
    if (localStorage.getItem('bb.cw.migrated.v2') === 'true') return;

    const updated = [];
    for (const it of continueItems) {
      // If it already has TMDB shape, keep it
      if (it.mediaType && typeof it.id === 'number' && it.poster) {
        updated.push(it);
        continue;
      }

      // Try to find a TMDB match via backend
      try {
        const q = (it.title || '').trim();
        if (!q) { updated.push(it); continue; }

        const res = await media.search.multi(q, 1, false);
        const hit = (res?.results || []).find(r =>
          r.media_type === 'movie' || r.media_type === 'tv'
        );

        if (!hit) { updated.push(it); continue; }

        const normalized = hit.media_type === 'movie'
          ? {
              ...it,
              id: hit.id,                 // TMDB id
              mediaType: 'movie',
              kind: 'movie',
              title: hit.title || hit.original_title || it.title,
              poster: tmdbImg(hit.poster_path),
              year: (hit.release_date || '').slice(0, 4),
            }
          : {
              ...it,
              id: hit.id,                 // TMDB id
              mediaType: 'tv',
              kind: 'show',
              title: hit.name || hit.original_name || it.title,
              poster: tmdbImg(hit.poster_path),
              year: (hit.first_air_date || '').slice(0, 4),
            };

        updated.push(normalized);
      } catch {
        updated.push(it);
      }
    }

    if (!cancelled) {
      setContinueItems(updated);
      localStorage.setItem(CW_KEY, JSON.stringify(updated));
      localStorage.setItem('bb.cw.migrated.v2', 'true');
    }
  }

  migrateCW();
  return () => { cancelled = true; };
}, []);
  /* ----------------------------------------------
     Sort CW
  ---------------------------------------------- */

  const continueSorted = useMemo(() => {
    return [...continueItems].sort((a, b) => {
      const at = new Date(a.lastWatchedAt || 0).getTime();
      const bt = new Date(b.lastWatchedAt || 0).getTime();
      return bt - at;
    });
  }, [continueItems]);

  /* ----------------------------------------------
      Suggested / Popular (API)
  ---------------------------------------------- */
  const [suggested, setSuggested] = useState([]);
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    loadSuggested();
    loadPopular();
  }, []);

  function normMovie(m) {
  return {
    id: m.id,
    mediaType: "movie",
    title: m.title || m.original_title,
    poster: tmdbImg(m.poster_path),
    kind: "movie",
    year: (m.release_date || "").slice(0, 4),
    release_date: m.release_date || "",   // ⬅ add
    rating: m.vote_average ?? null,
  };
}
function normTv(t) {
  return {
    id: t.id,
    mediaType: "tv",
    title: t.name || t.original_name,
    poster: tmdbImg(t.poster_path),
    kind: "show",
    year: (t.first_air_date || "").slice(0, 4),
    first_air_date: t.first_air_date || "",  // ⬅ add
    rating: t.vote_average ?? null,
  };
}

  async function loadSuggested() {
    try {
      const [mtop, tvtop] = await Promise.all([
        media.movies.topRated(1),
        media.tv.topRated(1),
      ]);
      const items = [
        ...(mtop?.results || []).map(normMovie),
        ...(tvtop?.results || []).map(normTv),
      ]
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, 20);
      setSuggested(items);
    } catch (e) { console.error(e); }
  }

  async function loadPopular() {
    try {
      const [mpop, tvpop] = await Promise.all([
        media.movies.popular(1),
        media.tv.popular(1),
      ]);
      const items = [
        ...(mpop?.results || []).map(normMovie),
        ...(tvpop?.results || []).map(normTv),
      ].slice(0, 20);
      setPopular(items);
    } catch (e) { console.error(e); }
  }

  /* ----------------------------------------------
      RENDER PAGE
  ---------------------------------------------- */
  return (
    <div className="space-y-10">

      {/* HEADER */}
      <header className="text-center">
        <h1 className="text-4xl font-extrabold">
          <span className="text-white">Binge</span>
          <span className="text-cyan-400">Buddy</span>
        </h1>
        <p className="text-slate-200 mt-2">Your personal streaming dashboard</p>
      </header>

      {/* CONTINUE WATCHING */}
      <Row
        title="Continue Watching"
        items={continueSorted}
        emptyHint="No in-progress titles."
        renderCard={(it) => {
          const isInWatchlist = watchlist.some(w => w.id === it.id);

          return (
            <Card
              key={it.id}
              title={it.title}
              poster={it.poster}
              kind={it.kind}
              mediaType={it.mediaType || (it.kind === "movie" ? "movie" : "tv")}
              id={it.id}
              itemInfo={{ release_date: it.release_date, first_air_date: it.first_air_date }}
        onClick={() => {
          const mt =
            it.mediaType ||
            (it.kind === "movie" ? "movie" : "tv"); // fallback for older CW entries
          navigate(`/details/${mt}/${it.id}`);
          }}
              footer={
                <>
                  <Progress value={it.progress || 0} />
                  {isInWatchlist && (
                    <div className="text-[10px] text-cyan-300">✓ In Watchlist</div>
                  )}
                </>
              }
            />
          );
        }}
      />

      {/* SUGGESTED */}
      <Row
        title="Suggested For You"
        items={suggested}
        emptyHint="Loading suggestions…"
        renderCard={(it) => (
          <Card
            key={`${it.mediaType}-${it.id}`}
            title={it.title}
            poster={it.poster}
            kind={it.kind}
            mediaType={it.mediaType} 
            id={it.id}
            itemInfo={{ release_date: it.release_date, first_air_date: it.first_air_date }}
            onClick={() => navigate(`/details/${it.mediaType}/${it.id}`)}
          />
        )}
      />

      {/* POPULAR */}
      <Row
        title="Popular Now"
        items={popular}
        emptyHint="Loading trending titles…"
        renderCard={(it) => (
          <Card
            key={`${it.mediaType}-${it.id}`}
            title={it.title}
            poster={it.poster}
            kind={it.kind}
            mediaType={it.mediaType} 
            id={it.id}  
            itemInfo={{ release_date: it.release_date, first_air_date: it.first_air_date }}
            onClick={() => navigate(`/details/${it.mediaType}/${it.id}`)}
          />
        )}
      />
    </div>
  );
}

/* ----------------------------------------------
   UI COMPONENTS
---------------------------------------------- */
function Row({ title, items, emptyHint, renderCard }) {
  return (
    <section>
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      {!items || items.length === 0 ? (
        <div className="border border-white/10 rounded-xl p-6 text-center text-slate-300">
          {emptyHint}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto py-1">
          {items.map((it) => renderCard(it))}
        </div>
      )}
    </section>
  );
}

function Card({ title, poster, kind, onClick, footer, mediaType, id, itemInfo }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!mediaType || !id) return;
    fetchPrimaryLabel(mediaType, id, itemInfo ?? {}).then(setLabel);
  }, [mediaType, id, itemInfo?.release_date, itemInfo?.first_air_date]);

  return (
    <button
      onClick={onClick}
      className="relative min-w-[160px] bg-white/5 border border-white/10 rounded-xl p-2 hover:bg-white/10 transition text-left"
    >
      <div className="relative w-full h-[200px] rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
        {poster ? (
          <img src={poster} alt={title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-slate-400">No Image</span>
        )}

        {label && (
          <div className="absolute left-2 top-2 px-2 py-1 rounded-md text-[10px] font-semibold bg-black/70 border border-white/15">
            {label}
          </div>
        )}
      </div>

      <div className="font-semibold mt-2 line-clamp-2">{title}</div>
      <div className="text-xs text-slate-400 capitalize">{kind}</div>

      {footer && <div className="mt-2">{footer}</div>}
    </button>
  );
}


function Progress({ value }) {
  return (
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
      <div className="h-full bg-cyan-400" style={{ width: `${value}%` }} />
    </div>
  );
}
