import { useEffect, useState } from "react";

export default function Watchlist() {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("watchlist.v1") || "[]");
    } catch {
      return [];
    }
  });
  const [title, setTitle] = useState("");

  // persist on change
  useEffect(() => {
    localStorage.setItem("watchlist.v1", JSON.stringify(items));
  }, [items]);

  const add = () => {
    const t = title.trim();
    if (!t) return;
    setItems((prev) => [{ id: crypto.randomUUID(), title: t }, ...prev]);
    setTitle("");
  };

  const remove = (id) => setItems((prev) => prev.filter((x) => x.id !== id));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Your Watchlist</h1>

      {/* Add form */}
      <div className="flex gap-2">
        <input
          className="border rounded-md px-3 py-2 flex-1"
          placeholder="Add a show or movie…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
        />
        <button
          className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800"
          onClick={add}
        >
          Add
        </button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="border rounded-lg p-6 text-center text-gray-500 bg-white shadow-sm">
          Your watchlist is empty. Add something above.
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <li
              key={it.id}
              className="bg-white border rounded-lg shadow-sm p-4 flex items-center justify-between"
            >
              <span className="font-medium text-black">{it.title}</span>
              <button
                className="text-red-600 hover:text-red-700 text-sm"
                onClick={() => remove(it.id)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
