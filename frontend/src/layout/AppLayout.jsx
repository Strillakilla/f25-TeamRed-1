// src/layout/AppLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import AdRails from "../components/AdRails.jsx";

export default function AppLayout() {
  const { pathname } = useLocation();
  const hideRails = pathname === "/get-started"; // still hide on landing if you want

  return (
    <div className="relative min-h-screen bg-slate-950">
      {/* SIDE AD RAILS */}
      {!hideRails && (
        <>
          {/* LEFT rail */}
          <div
            className="
              pointer-events-none
              fixed inset-y-32 left-4
              flex items-center
            "
          >
            <AdRails position="left" />
          </div>

          {/* RIGHT rail */}
          <div
            className="
              pointer-events-none
              fixed inset-y-32 right-4
              flex items-center
            "
          >
            <AdRails position="right" />
          </div>
        </>
      )}

      {/* MAIN CONTENT */}
      <main
        className="
          relative z-0
          max-w-6xl mx-auto
          px-4 py-6
          md:px-8
          lg:px-16
        "
      >
        <Outlet />
      </main>
    </div>
  );
}