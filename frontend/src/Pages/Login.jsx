import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginAuth, whoAmI } from "../utils/api"; // <-- use your api helpers

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const emailOk = useMemo(() => /^\S+@\S+\.\S+$/.test(email.trim()), [email]);
  const pwOk = pw.length >= 8;
  const formValid = emailOk && pwOk;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!formValid) {
      setError("Please enter a valid email and an 8+ character password.");
      return;
    }

    try {
      setSubmitting(true);

      // 1) call backend
      const auth = await loginAuth(email.trim(), pw); 
      // expected shape: { token, username, email, id }

      // 2) persist session (JWT used by api.js Authorization header)
      localStorage.setItem("bb.jwt", auth.token);
      localStorage.setItem("bb.user.email", auth.email || email.trim());
      localStorage.setItem("bb.user.name", auth.username || "");

      // optional “remember me” switch
      localStorage.setItem("bb.auth.remember", remember ? "true" : "false");

      // 3) sanity check the token works (optional but useful during dev)
      //    This should return 200 with current user when Authorization header is present
      try { await whoAmI(); } catch { /* ignore; you can log if you want */ }

      // 4) go to app
      navigate("/home");
    } catch (err) {
      setError(typeof err?.message === "string" ? err.message : "Login failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md bg-black/40 border border-white/10 rounded-2xl p-6">
        <h1 className="text-3xl font-bold mb-6 text-teal-300 text-center">Log In to BingeBuddy</h1>

        {error && (
          <div className="mb-4 text-sm text-red-200 bg-red-900/30 border border-red-500/30 rounded px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-md px-3 py-2 bg-white/90 text-gray-900 outline-none border border-transparent focus:border-teal-400"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {!emailOk && email.length > 0 && (
              <p className="mt-1 text-xs text-red-300">Enter a valid email.</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                className="w-full rounded-md px-3 py-2 bg-white/90 text-gray-900 outline-none border border-transparent focus:border-teal-400 pr-24"
                placeholder="Your password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && formValid && onSubmit(e)}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-700 hover:text-gray-900"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
            {!pwOk && pw.length > 0 && (
              <p className="mt-1 text-xs text-red-300">Password must be at least 8 characters.</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="accent-teal-500"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-teal-300 hover:text-teal-200"
            >
              Forgot your password?
            </button>
          </div>

          <button
            type="submit"
            disabled={!formValid || submitting}
            className={`w-full px-6 py-3 rounded-full font-semibold text-white transition
              ${formValid && !submitting
                ? "bg-gradient-to-r from-teal-400 to-purple-600 hover:opacity-90"
                : "bg-white/10 cursor-not-allowed text-white/70"}`}
          >
            {submitting ? "Signing in…" : "Log In"}
          </button>

          <p className="text-xs text-slate-300 text-center">
            New here?{" "}
            <Link to="/create-account-form" className="underline hover:opacity-90">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
