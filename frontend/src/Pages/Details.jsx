// src/Pages/Details.jsx
import { useParams, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { media, tmdbImg } from "../utils/api.js";

export default function Details() {
  const { type, id } = useParams();           // type: "movie" | "tv"
  const location = useLocation();
  const stateShow = location.state?.show;     // optional pre-fetched item
  const [item, setItem] = useState(stateShow || null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (stateShow && stateShow.detailsLoaded) return;
        const data = type === "movie"
          ? await media.movies.details(id)
          : await media.tv.details(id);
        if (!cancelled) {
          setItem({
            ...data,
            poster_full: tmdbImg(data.poster_path, "w780"),
            backdrop_full: tmdbImg(data.backdrop_path, "w1280"),
            detailsLoaded: true,
          });
        }
      } catch (err) { console.error(err); }
    }
    load();
    return () => { cancelled = true; };
  }, [type, id]);

  if (!item) return <div className="p-6 text-white text-xl">Loading…</div>;

  const title = type === "movie" ? (item.title || item.original_title) : (item.name || item.original_name);
  const summary = (item.overview || "").trim();

  return (
    <div className="p-6 text-white space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={item.poster_full || tmdbImg(item.poster_path)}
          alt={title}
          className="w-64 rounded-lg shadow-lg"
        />
        <div className="flex-1 space-y-3">
          <h1 className="text-4xl font-bold">{title}</h1>
          <p className="text-slate-300">{summary || "No summary available."}</p>

          {type === "movie" ? (
            <>
              <p><strong>Release:</strong> {item.release_date}</p>
              <p><strong>Rating:</strong> {item.vote_average}</p>
              <p><strong>Runtime:</strong> {item.runtime} min</p>
            </>
          ) : (
            <>
              <p><strong>First Air:</strong> {item.first_air_date}</p>
              <p><strong>Rating:</strong> {item.vote_average}</p>
              <p><strong>Episodes:</strong> {item.number_of_episodes}</p>
              <p><strong>Seasons:</strong> {item.number_of_seasons}</p>
              <p><strong>Status:</strong> {item.status}</p>
            </>
          )}
          <p><strong>Genres:</strong> {(item.genres || []).map(g => g.name).join(", ")}</p>
          <p><strong>Language:</strong> {item.original_language?.toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}
