import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";

const USER_EMAIL_KEY = "bb.user.email";
const USER_NAME_KEY  = "bb.user.name";
const WATCHLIST_KEY  = "watchlist.v1";

export default function Account() {
  const navigate = useNavigate();

  // “Auth” check — if no email saved, send user to login
  const email = useMemo(() => localStorage.getItem(USER_EMAIL_KEY) || "", []);
  useEffect(() => {
    if (!email) navigate("/login");
  }, [email, navigate]);

  const [name, setName] = useState(localStorage.getItem(USER_NAME_KEY) || "");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const watchlistCount = useMemo(() => {
    try { return (JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]") || []).length; }
    catch { return 0; }
  }, []);

  const initials = useMemo(() => {
    const base = name?.trim() || email?.split("@")[0] || "BB";
    return base.split(/[.\s_-]+/).filter(Boolean).slice(0,2).map(s => s[0].toUpperCase()).join("") || "BB";
  }, [name, email]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 1500);
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    localStorage.setItem(USER_NAME_KEY, name.trim());
    showToast("Saved");
    setSaving(false);
  }

  function signOut() {
    // Keep watchlist, but clear auth
    localStorage.removeItem(USER_EMAIL_KEY);
    // optionally: localStorage.removeItem(USER_NAME_KEY);
    navigate("/login");
  }

  return (
    <div className="min-h-[70vh] max-w-3xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center text-lg font-semibold">
          {initials}
        </div>
        <div>
          <h1 className="text-3xl font-bold">Account</h1>
          <p className="text-slate-300 text-sm">Manage your profile and settings</p>
        </div>
      </header>

      {toast && (
        <div className="text-sm text-white bg-white/10 border border-white/15 rounded px-3 py-2 inline-block">
          {toast}
        </div>
      )}

      {/* Profile */}
      <section className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Profile</h2>

        <form className="space-y-4" onSubmit={saveProfile}>
          <div>
            <label className="block text-sm mb-1">Display name</label>
            <input
              className="w-full rounded-md px-3 py-2 bg-white/90 text-gray-900 outline-none border border-transparent focus:border-teal-400"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-300">Shown in the app UI (not required).</p>
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              disabled
              value={email}
              className="w-full rounded-md px-3 py-2 bg-white/60 text-gray-800 border border-transparent"
            />
            <p className="mt-1 text-xs text-slate-300">Linked to this device’s demo session.</p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2 rounded-full text-white font-semibold transition
                ${saving ? "bg-white/10 cursor-not-allowed" : "bg-gradient-to-r from-teal-400 to-purple-600 hover:opacity-90"}`}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>

            <button
              type="button"
              onClick={signOut}
              className="px-5 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            >
              Sign out
            </button>
          </div>
        </form>
      </section>

      {/* Quick links / Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/watchlist"
          className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition"
        >
          <div className="text-sm text-slate-300">Watchlist</div>
          <div className="text-2xl font-bold">{watchlistCount}</div>
          <div className="text-xs text-slate-400 mt-1">items saved</div>
        </Link>

        <Link
          to="/subscriptions"
          className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition"
        >
          <div className="text-sm text-slate-300">Subscriptions</div>
          <div className="text-2xl font-bold">Manage</div>
          <div className="text-xs text-slate-400 mt-1">view & edit services</div>
        </Link>
      </section>

      {/* Security card with link */}
      <section className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Security</h3>
            <p className="text-sm text-slate-300">Password changes & multi-factor authentication.</p>
          </div>
          <NavLink
            to="/security"
            className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-sm"
          >
            Open
          </NavLink>
        </div>
      </section>
    </div>
  );
}
