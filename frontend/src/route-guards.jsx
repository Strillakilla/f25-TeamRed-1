// src/route-guards.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthed } from "./utils/auth";

export function RequireAuth() {
  const ok = isAuthed();
  const loc = useLocation();
  return ok ? <Outlet /> : <Navigate to="/login" replace state={{ from: loc }} />;
}

export function RequireAnon() {
  const ok = isAuthed();
  return ok ? <Navigate to="/home" replace /> : <Outlet />;
}
