// src/Pages/Home.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    async function enrich() {
      const updated = await Promise.all(
        continueItems.map(async (it) => {
          if (it.poster) return it;

          try {
            const res = await fetch(
              `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(it.title)}`
            );
            const data = await res.json();

            return {
              ...it,
              id: data.id,
              poster: data.image?.medium || data.image?.original || ""
            };
          } catch {
            return it;
          }
        })
      );

      setContinueItems(updated);
      localStorage.setItem(CW_KEY, JSON.stringify(updated));
    }

    enrich();
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

  async function loadSuggested() {
    try {
      const res = await fetch(`https://api.tvmaze.com/shows?page=1`);
      const data = await res.json();

      const result = data
        .filter(s => s.rating?.average)
        .sort((a, b) => b.rating.average - a.rating.average)
        .slice(0, 20)
        .map(normalizeShow);

      setSuggested(result);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadPopular() {
    try {
      const res = await fetch(`https://api.tvmaze.com/shows?page=0`);
      const data = await res.json();

      const result = data
        .sort((a, b) => (b.weight || 0) - (a.weight || 0))
        .slice(0, 20)
        .map(normalizeShow);

      setPopular(result);
    } catch (err) {
      console.error(err);
    }
  }

  function normalizeShow(show) {
    return {
      id: show.id,
      title: show.name,
      poster: show.image?.medium || show.image?.original || "",
      kind: show.type?.toLowerCase() === "movie" ? "movie" : "show",
      year: show.premiered?.slice(0, 4),
      rating: show.rating?.average
    };
  }

  /* ----------------------------------------------
      RENDER PAGE
  ---------------------------------------------- */
  return (
    <div className="space-y-10">

      {/* HEADER */}
      <header className="text-center">
        <h1 className="text-4xl font-extrabold">
          <span className="text-teal-300">Binge</span>Buddy
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
              onClick={() => navigate(`/details/${it.id}`)}
              footer={
                <>
                  <Progress value={it.progress || 0} />
                  {isInWatchlist && (
                    <div className="text-[10px] text-teal-300">✓ In Watchlist</div>
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
            key={it.id}
            title={it.title}
            poster={it.poster}
            kind={it.kind}
            onClick={() => navigate(`/details/${it.id}`)}
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
            key={it.id}
            title={it.title}
            poster={it.poster}
            kind={it.kind}
            onClick={() => navigate(`/details/${it.id}`)}
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

function Card({ title, poster, kind, onClick, footer }) {
  return (
    <button
      onClick={onClick}
      className="min-w-[160px] bg-white/5 border border-white/10 rounded-xl p-2 hover:bg-white/10 transition text-left"
    >
      <div className="w-full h-[200px] rounded-lg overflow-hidden bg-white/10 flex items-center justify-center">
        {poster ? (
          <img src={poster} alt={title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs text-slate-400">No Image</span>
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
      <div className="h-full bg-teal-400" style={{ width: `${value}%` }} />
    </div>
  );
}
