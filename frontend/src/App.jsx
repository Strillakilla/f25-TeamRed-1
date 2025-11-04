import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import GetStarted from "./Get-StartedPage.jsx";
import Home from "./Home.jsx";
import AccountCreation from "./AccountCreation.jsx";
import Subscriptions from "./Subscriptions.jsx";
import Watchlist from "./Watchlist.jsx";
import MoviesShows from "./MoviesShows.jsx";

export default function App() {
  const { pathname } = useLocation();
  const showNavbar = pathname !== "/"; // hide navbar on the Get Started landing

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#1A093A] to-[#2D0F4E] text-slate-100">
      {showNavbar && <Navbar />}

      <main className="max-w-6xl mx-auto px-6 py-6">
        <Routes>
          {/* Landing page */}
          <Route path="/" element={<GetStarted />} />

          {/* Give Home its own path (avoid duplicate "/") */}
          <Route path="/home" element={<Home />} />

          {/* Inner pages */}
          <Route path="/create-account" element={<AccountCreation />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/movies" element={<MoviesShows />} />
        </Routes>
      </main>
    </div>
  );
}
