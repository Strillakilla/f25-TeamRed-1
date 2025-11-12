// src/utils/http.js
async function handle(res) {
  // 204/205 No Content: return {}
  if (res.status === 204 || res.status === 205) return {};
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${text || ''}`);
  }
  try { return text ? JSON.parse(text) : {}; } catch { return {}; }
}

export async function getJson(path) {
  const res = await fetch(path, { credentials: 'include' });
  return handle(res);
}

export async function postJson(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handle(res);
}

export async function delJson(path, body) {
  // Our backend may require a body with DELETE; some servers reject it → we’ll still try.
  const res = await fetch(path, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  return handle(res);
}
