// src/layout/AppLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import AdRails from "../components/AdRails.jsx";

export default function AppLayout() {
  const { pathname } = useLocation();
  const hideRails = pathname === "/get-started"; // no rails on landing

  return (
    <div className="relative">
      {/* Side ad placeholders (desktop only, fixed to viewport) */}
      {!hideRails && <AdRails />}

      {/* Main content container */}
      <main
        className="
          max-w-6xl mx-auto
          px-6 py-6
          lg:px-[220px]   /* make room for 160–180px rails */
        "
      >
        <Outlet />
      </main>
    </div>
  );
}
