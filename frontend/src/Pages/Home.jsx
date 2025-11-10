// src/Pages/Home.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const CW_KEY = "bb.continue.v1";

export default function Home() {
  const navigate = useNavigate();

  /* -------------------------------------------------
     CONTINUE WATCHING
  ------------------------------------------------- */
  const [continueItems, setContinueItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CW_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const continueSorted = useMemo(() => {
    return [...continueItems].sort((a, b) => {
      const at = a.lastWatchedAt ? new Date(a.lastWatchedAt).getTime() : 0;
      const bt = b.lastWatchedAt ? new Date(b.lastWatchedAt).getTime() : 0;
      return bt - at;
    });
  }, [continueItems]);

  /* -------------------------------------------------
     API-BASED ROWS
  ------------------------------------------------- */
  const [suggested, setSuggested] = useState([]);
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    loadSuggested();
    loadPopular();
  }, []);

  async function loadSuggested() {
    try {
      // Fake “recommended”: top-rated shows
      const res = await fetch(`https://api.tvmaze.com/shows?page=1`);
      const data = await res.json();

      const topRated = data
        .filter(s => s.rating?.average)
        .sort((a, b) => b.rating.average - a.rating.average)
        .slice(0, 20)
        .map(normalizeShow);

      setSuggested(topRated);
    } catch (err) {
      console.error("Failed to load suggested:", err);
    }
  }

  async function loadPopular() {
    try {
      // TVMaze trending / popular (page 0)
      const res = await fetch(`https://api.tvmaze.com/shows?page=0`);
      const data = await res.json();

      const trending = data
        .sort((a, b) => (b.weight || 0) - (a.weight || 0))
        .slice(0, 20)
        .map(normalizeShow);

      setPopular(trending);
    } catch (err) {
      console.error("Failed to load popular:", err);
    }
  }

  /* -------------------------------------------------
     Shared normalize formatter
  ------------------------------------------------- */
  function normalizeShow(show) {
    return {
      id: show.id,
      title: show.name,
      poster: show.image?.medium || show.image?.original || "",
      kind: show.type?.toLowerCase() === "movie" ? "movie" : "show",
      year: show.premiered?.slice(0, 4) || "",
      rating: show.rating?.average ?? null,
      genres: show.genres || [],
    };
  }

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <header className="text-center">
        <h1 className="text-4xl font-extrabold">
          <span className="text-teal-300">Binge</span>
          <span className="text-white">Buddy</span>
        </h1>
        <p className="text-slate-200 mt-2">
          Your personal streaming dashboard
        </p>
      </header>

      {/* CONTINUE WATCHING */}
      <Row
        title="Continue Watching"
        items={continueSorted}
        emptyHint="No in-progress titles yet."
        renderCard={(it) => (
          <Card
            key={it.id}
            title={it.title}
            poster={it.poster}
            kind={it.kind}
            onClick={() => navigate(`/details/${it.id}`)}
            footer={<Progress value={it.progress || 0} />}
          />
        )}
      />

      {/* SUGGESTED FOR YOU */}
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

      {/* POPULAR NOW */}
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

/* -------------------------------------------------
   UI COMPONENTS
------------------------------------------------- */

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
      className="min-w-[160px] text-left bg-white/5 border border-white/10 rounded-xl p-2 hover:bg-white/10 transition"
    >
      <div className="w-full h-[200px] bg-white/10 rounded-lg mb-2 overflow-hidden flex items-center justify-center">
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs text-slate-300">No Image</span>
        )}
      </div>

      <div className="font-semibold leading-tight line-clamp-2">{title}</div>
      <div className="text-xs text-slate-400 capitalize">{kind}</div>

      {footer && <div className="mt-2">{footer}</div>}
    </button>
  );
}

function Progress({ value }) {
  return (
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full bg-teal-400"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
