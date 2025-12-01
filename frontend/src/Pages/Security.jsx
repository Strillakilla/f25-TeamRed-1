import { useEffect, useMemo, useState } from "react";

const MFA_KEY = "bb.security.mfa.enabled";
const CODES_KEY = "bb.security.mfa.backupCodes";

export default function Security() {
  // ----- MFA state (mock/local only) -----
  const [mfaEnabled, setMfaEnabled] = useState(
    () => localStorage.getItem(MFA_KEY) === "true"
  );
  const [codes, setCodes] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CODES_KEY) || "[]"); }
    catch { return []; }
  });

  // ----- Password form (UI only) -----
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  // Simple password strength heuristic (front-end only)
  const pwStrength = useMemo(() => {
    let score = 0;
    if (newPw.length >= 8) score++;
    if (/[A-Z]/.test(newPw)) score++;
    if (/[a-z]/.test(newPw)) score++;
    if (/\d/.test(newPw)) score++;
    if (/[^A-Za-z0-9]/.test(newPw)) score++;
    return score; // 0..5
  }, [newPw]);

  const pwMatch = newPw && newPw === confirmPw;
  const pwValid = pwStrength >= 3 && pwMatch;

  // Persist MFA changes
  useEffect(() => {
    localStorage.setItem(MFA_KEY, mfaEnabled ? "true" : "false");
  }, [mfaEnabled]);

  useEffect(() => {
    localStorage.setItem(CODES_KEY, JSON.stringify(codes));
  }, [codes]);

  // Generate mock backup codes
  function generateCodes() {
    const rnd = () =>
      Math.random().toString(36).slice(2).toUpperCase().replace(/[^A-Z0-9]/g, "");
    const pad = (s, n) => (s + "0".repeat(n)).slice(0, n);

    const list = Array.from({ length: 8 }, () => {
      const raw = rnd() + rnd();
      const token = pad(raw.replace(/[^A-Z0-9]/g, ""), 8);
      return token.slice(0, 4) + "-" + token.slice(4, 8);
    });
    setCodes(list);
  }

  async function copyCodes() {
    const text = codes.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      alert("Backup codes copied to clipboard.");
    } catch {
      alert("Copy failed. You can download them instead.");
    }
  }

  function downloadCodes() {
    const blob = new Blob(
      [
        "BingeBuddy Backup Codes\n\n",
        ...codes.map((c) => c + "\n"),
        "\nKeep these in a safe place.",
      ],
      { type: "text/plain;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = "bingeBuddy-backup-codes.txt";
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold">Security</h1>
        <p className="text-slate-300">
          Manage your password and multi-factor authentication.
        </p>
      </header>

      {/* Password change (UI only) */}
      <section className="bg-black/40 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-semibold">Password</h2>
          <Badge>Coming soon</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LabeledInput
            label="Current password"
            type="password"
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            placeholder="••••••••"
            disabled
          />
          <div className="space-y-4">
            <LabeledInput
              label="New password"
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="At least 8 characters"
              disabled
            />
            <StrengthBar score={pwStrength} />
          </div>
          <LabeledInput
            label="Confirm new password"
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
            placeholder="Re-enter password"
            disabled
          />
        </div>

        <div className="mt-4">
          <button
            className="px-5 py-2 rounded-full bg-white/10 text-white cursor-not-allowed"
            title="Backend integration required"
            disabled
          >
            Update password
          </button>
          {!pwMatch && confirmPw.length > 0 && (
            <p className="text-xs text-red-300 mt-2">Passwords don’t match.</p>
          )}
        </div>
      </section>

      {/* MFA */}
      <section className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Multi-factor authentication (MFA)</h2>
          <Badge color={mfaEnabled ? "green" : "yellow"}>
            {mfaEnabled ? "Enabled (local)" : "Disabled"}
          </Badge>
        </div>

        <p className="text-slate-300">
          Add a second step at sign-in using an authenticator app. This demo stores
          settings <em>only on this device</em> until backend integration is added.
        </p>

        {!mfaEnabled ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 p-4">
              <div className="text-sm text-slate-300 mb-2">Authenticator setup (mock)</div>
              <div className="flex items-center gap-4">
                <div className="w-28 h-28 rounded-lg bg-white/10 flex items-center justify-center text-xs text-slate-400">
                  QR
                </div>
                <div className="text-sm text-slate-300">
                  Scan this QR code in your authenticator app.<br />
                  Or enter the key: <code className="bg-white/10 px-1 rounded">BINGE-BUDDY-DEMO</code>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => { setMfaEnabled(true); generateCodes(); }}
                className="px-5 py-2 rounded-full bg-gradient-to-r from-teal-400 to-purple-600 text-white font-semibold hover:opacity-90 transition"
              >
                Enable MFA (mock)
              </button>
              <button
                onClick={generateCodes}
                className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20"
              >
                Generate backup codes
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 p-4">
              <div className="text-sm text-slate-300 mb-2">Backup codes</div>
              {codes.length === 0 ? (
                <p className="text-slate-400">No codes yet. Generate a new set below.</p>
              ) : (
                <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {codes.map((c) => (
                    <li key={c} className="text-center bg-white/5 border border-white/10 rounded-md py-2 font-mono">
                      {c}
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap gap-3 mt-3">
                <button onClick={generateCodes} className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20">
                  Regenerate
                </button>
                <button onClick={copyCodes} className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20">
                  Copy
                </button>
                <button onClick={downloadCodes} className="px-4 py-2 rounded-md bg-white/10 hover:bg-white/20">
                  Download
                </button>
              </div>
            </div>

            <button
              onClick={() => { setMfaEnabled(false); setCodes([]); }}
              className="px-5 py-2 rounded-full bg-red-600/80 text-white hover:bg-red-600 transition"
            >
              Disable MFA (mock)
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

/* ---------- UI bits ---------- */

function LabeledInput({ label, className = "", ...props }) {
  return (
    <label className="block">
      <div className="text-sm mb-1">{label}</div>
      <input
        {...props}
        className={`w-full rounded-md px-3 py-2 bg-white/90 text-gray-900 outline-none border border-transparent focus:border-cyan-500 ${className}`}
      />
    </label>
  );
}

function Badge({ children, color }) {
  const styles =
    color === "green"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      : color === "yellow"
      ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      : "bg-white/10 text-slate-200 border-white/20";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles}`}>
      {children}
    </span>
  );
}

function StrengthBar({ score }) {
  const segments = 5;
  return (
    <div className="flex gap-1">
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded ${
            i < score ? "bg-cyan-500" : "bg-white/10"
          }`}
        />
      ))}
    </div>
  );
}
