// src/Pages/Home.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * CONTINUE WATCHING
 * - Reads from localStorage("bb.continue.v1")
 * - Each item shape: { id, title, kind: "movie"|"show", poster?, progress: 0..100, lastWatchedAt }
 * - You can write to it from your player page later.
 */
const CW_KEY = "bb.continue.v1";

export default function Home() {
  const navigate = useNavigate();

  // ---- Continue Watching (persisted) ----
  const [continueItems, setContinueItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(CW_KEY) || "[]");
    } catch {
      return [];
    }
  });

  // Sort by most recently watched
  const continueSorted = useMemo(() => {
    return [...continueItems].sort((a, b) => {
      const at = a.lastWatchedAt ? new Date(a.lastWatchedAt).getTime() : 0;
      const bt = b.lastWatchedAt ? new Date(b.lastWatchedAt).getTime() : 0;
      return bt - at;
    });
  }, [continueItems]);

  // Example seed (dev only): uncomment once to see cards
  useEffect(() => {
    if (continueItems.length === 0) {
      const seed = [
        { id: "cw1", title: "Arcane", kind: "show", progress: 45, lastWatchedAt: new Date().toISOString() },
        { id: "cw2", title: "Dune", kind: "movie", progress: 10, lastWatchedAt: new Date(Date.now()-86400000).toISOString() },
      ];
      localStorage.setItem(CW_KEY, JSON.stringify(seed));
      setContinueItems(seed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Suggested & Popular (mock data for now) ----
  const suggested = [
    { id: "s1", title: "Bridgerton", kind: "show" },
    { id: "s2", title: "The Bear", kind: "show" },
    { id: "s3", title: "Everything Everywhere All at Once", kind: "movie" },
    { id: "s4", title: "Fallout", kind: "show" },
  ];

  const popular = [
    { id: "p1", title: "Deadpool & Wolverine", kind: "movie" },
    { id: "p2", title: "Inside Out 2", kind: "movie" },
    { id: "p3", title: "House of the Dragon", kind: "show" },
    { id: "p4", title: "One Piece", kind: "show" },
  ];

  return (
    <div className="space-y-10">
      {/* Page header */}
      <header className="text-center">
        <h1 className="text-4xl font-extrabold">
          <span className="text-teal-300">Binge</span>
          <span className="text-fuchsia-300">Buddy</span>
        </h1>
        <p className="text-slate-200 mt-2">Your personal streaming dashboard</p>
      </header>

      {/* Continue Watching */}
      <Row
        title="Continue Watching"
        items={continueSorted}
        emptyHint="No in-progress titles. Start something from Movies & Shows."
        renderCard={(it) => (
          <Card
            key={it.id}
            title={it.title}
            kind={it.kind}
            onClick={() => navigate("/watchlist")}
            footer={
              <Progress value={Math.max(0, Math.min(100, Number(it.progress) || 0))} />
            }
          />
        )}
      />

      {/* Suggested For You (mock; ready for API) */}
      <Row
        title="Suggested For You"
        items={suggested}
        emptyHint="Suggestions will appear here."
        renderCard={(it) => (
          <Card
            key={it.id}
            title={it.title}
            kind={it.kind}
            onClick={() => navigate("/movies")}
          />
        )}
      />

      {/* Popular Now (mock; ready for API) */}
      <Row
        title="Popular Now"
        items={popular}
        emptyHint="No trending items right now."
        renderCard={(it) => (
          <Card
            key={it.id}
            title={it.title}
            kind={it.kind}
            onClick={() => navigate("/movies")}
          />
        )}
      />
    </div>
  );
}

/* ----------------- Reusable UI ----------------- */

function Row({ title, items, emptyHint, renderCard }) {
  return (
    <section>
      <div className="flex items-end justify-between mb-3">
        <h2 className="text-2xl font-bold">{title}</h2>
        {/* Optional: “See all” link can go to /movies with filters */}
      </div>

      {(!items || items.length === 0) ? (
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

function Card({ title, kind, onClick, footer }) {
  return (
    <button
      onClick={onClick}
      className="min-w-[160px] text-left bg-white/5 border border-white/10 rounded-xl p-2 hover:bg-white/10 transition"
    >
      {/* Poster placeholder (swap with real image later) */}
      <div className="w-full h-[200px] bg-white/10 rounded-lg mb-2 flex items-center justify-center text-xs text-slate-300">
        Poster
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
        aria-label={`Progress ${value}%`}
      />
    </div>
  );
}
