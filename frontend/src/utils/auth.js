// src/utils/auth.js
function decodeJwtPayload(token) {
  const part = token.split(".")[1];
  if (!part) throw new Error("bad token");
  // base64url → base64
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const json = atob(padded);
  return JSON.parse(json);
}

export function isAuthed() {
  const t = localStorage.getItem("bb.jwt");
  if (!t) return false;
  try {
    const { exp } = decodeJwtPayload(t);
    // if exp missing, treat as not authed
    if (typeof exp !== "number") return false;
    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export function onAuthExpired(cb) {
  window.addEventListener("auth:expired", cb);
  return () => window.removeEventListener("auth:expired", cb);
}
