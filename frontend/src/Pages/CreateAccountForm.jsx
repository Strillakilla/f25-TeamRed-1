// src/pages/CreateAccountForm.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function CreateAccountForm() {
  const navigate = useNavigate();

  // form state
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [agree, setAgree] = useState(false);

  // ui state
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [touched, setTouched] = useState({ email: false, pw: false, pw2: false });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  // validators
  const emailOk = useMemo(() => /^\S+@\S+\.\S+$/.test(email.trim()), [email]);
  const pwLen = pw.length >= 8;
  const pwHasUpper = /[A-Z]/.test(pw);
  const pwHasLower = /[a-z]/.test(pw);
  const pwHasDigit = /\d/.test(pw);
  const pwHasSymbol = /[^A-Za-z0-9]/.test(pw);
  const pwStrongScore = [pwLen, pwHasUpper, pwHasLower, pwHasDigit, pwHasSymbol].filter(Boolean).length;
  const pwStrongLabel =
    pwStrongScore <= 2 ? "Weak" : pwStrongScore === 3 ? "Okay" : pwStrongScore === 4 ? "Good" : "Strong";
  const pwMatches = pw && pw2 && pw === pw2;

  const formValid = emailOk && pwLen && pwHasUpper && pwHasLower && pwHasDigit && pwMatches && agree;

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 1600);
    return () => clearTimeout(id);
  }, [toast]);

  async function onSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, pw: true, pw2: true });

    if (!formValid) {
      setToast("Please fix the errors");
      return;
    }

    try {
      setSubmitting(true);

      // 1) Register
      const regRes = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email.trim().split("@")[0],
          email: email.trim(),
          password: pw,
        }),
      });
      if (!regRes.ok) {
        const msg = await regRes.text();
        throw new Error(msg || `Register failed (${regRes.status})`);
      }

      // 2) Login
      const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: pw }),
      });
      if (!loginRes.ok) {
        const msg = await loginRes.text();
        throw new Error(msg || `Login failed (${loginRes.status})`);
      }

      const data = await loginRes.json(); // { token, username, email, id }

      // 3) Persist auth
      localStorage.setItem("bb.jwt", data.token);
      localStorage.setItem("bb.user.email", data.email || email.trim());
      if (data.username) localStorage.setItem("bb.user.name", data.username);

      setToast("Account created");
      // 4) In-app navigation
      navigate("/home");
    } catch (err) {
      setToast(String(err.message || err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md bg-black/40 border border-white/10 rounded-2xl p-6">
        <h1 className="text-3xl font-bold mb-6 text-cyan-400 text-center">Create Your Account</h1>

        {toast && (
          <div className="mb-4 text-sm text-white bg-white/10 border border-white/15 rounded px-3 py-2 text-center">
            {toast}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-md px-3 py-2 bg-white/90 text-gray-900 outline-none border border-transparent focus:border-cyan-500"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            />
            {touched.email && !emailOk && (
              <p className="mt-1 text-xs text-red-300">Enter a valid email address.</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-1">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                className="w-full rounded-md px-3 py-2 bg-white/90 text-gray-900 outline-none border border-transparent focus:border-cyan-500 pr-24"
                placeholder="At least 8 characters"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, pw: true }))}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-700 hover:text-gray-900"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>

            <div className="mt-2">
              <div className="h-1 w-full bg-white/10 rounded">
                <div
                  className={`h-1 rounded ${
                    pwStrongScore <= 2
                      ? "bg-red-400 w-1/4"
                      : pwStrongScore === 3
                      ? "bg-yellow-400 w-2/4"
                      : pwStrongScore === 4
                      ? "bg-cyan-500 w-3/4"
                      : "bg-emerald-500 w-full"
                  }`}
                />
              </div>
              <p className="mt-1 text-xs text-slate-200">Strength: {pw ? pwStrongLabel : "—"}</p>
            </div>

            {touched.pw && (
              <ul className="mt-2 text-xs space-y-1">
                <Req ok={pwLen}>At least 8 characters</Req>
                <Req ok={pwHasUpper}>One uppercase letter</Req>
                <Req ok={pwHasLower}>One lowercase letter</Req>
                <Req ok={pwHasDigit}>One number</Req>
              </ul>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showPw2 ? "text" : "password"}
                className="w-full rounded-md px-3 py-2 bg-white/90 text-gray-900 outline-none border border-transparent focus:border-cyan-500 pr-24"
                placeholder="Re-enter password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, pw2: true }))}
              />
              <button
                type="button"
                onClick={() => setShowPw2((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-700 hover:text-gray-900"
              >
                {showPw2 ? "Hide" : "Show"}
              </button>
            </div>
            {touched.pw2 && pw && !pwMatches && (
              <p className="mt-1 text-xs text-red-300">Passwords do not match.</p>
            )}
          </div>

          {/* Terms */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="accent-cyan-600"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <span>
              I agree to the <span className="underline">Terms</span> and{" "}
              <span className="underline">Privacy Policy</span>.
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={!formValid || submitting}
            className={`w-full px-6 py-3 rounded-full font-semibold text-white transition
              ${
                formValid && !submitting
                  ? "bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90"
                  : "bg-white/10 cursor-not-allowed text-white/70"
              }`}
          >
            {submitting ? "Creating..." : "Create Account"}
          </button>

          <p className="text-xs text-slate-300 text-center">
            Already have an account?{" "}
            <Link to="/login" className="underline hover:opacity-90">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

function Req({ ok, children }) {
  return (
    <li className={`flex items-center gap-2 ${ok ? "text-emerald-300" : "text-slate-300"}`}>
      <span className={`inline-block h-2 w-2 rounded-full ${ok ? "bg-emerald-400" : "bg-white/20"}`} />
      {children}
    </li>
  );
}
