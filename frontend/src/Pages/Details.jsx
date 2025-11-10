import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Details() {
  const { id } = useParams();
  const [item, setItem] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`https://api.tvmaze.com/shows/${id}`);
        const data = await res.json();
        setItem(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [id]);

  // ✅ PREVENT RUNTIME CRASH
  if (!item) {
    return (
      <div className="p-6 text-white text-xl">
        Loading…
      </div>
    );
  }

  return (
    <div className="p-6 text-white space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <img
          src={item.image?.original || item.image?.medium}
          alt={item.name}
          className="w-64 rounded-lg shadow-lg"
        />

        <div className="flex-1 space-y-3">
          <h1 className="text-4xl font-bold">{item.name}</h1>

          <p className="text-slate-300">
            {item.summary?.replace(/<[^>]+>/g, "")}
          </p>

          <p><strong>Type:</strong> {item.type}</p>
          <p><strong>Genres:</strong> {item.genres?.join(", ")}</p>
          <p><strong>Language:</strong> {item.language}</p>
          <p><strong>Status:</strong> {item.status}</p>
          <p><strong>Premiered:</strong> {item.premiered}</p>
          <p><strong>Rating:</strong> ⭐ {item.rating?.average}</p>
          <p><strong>Runtime:</strong> {item.runtime} min</p>
          <p><strong>Network:</strong> {item.network?.name || item.webChannel?.name}</p>
        </div>
      </div>
    </div>
  );
}

