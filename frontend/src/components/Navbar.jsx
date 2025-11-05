import { NavLink } from "react-router-dom";

const item = ({ isActive }) =>
  `px-3 py-2 rounded-md text-sm font-medium ${
    isActive ? "bg-white/10 text-white" : "text-slate-100/80 hover:text-white"
  }`;

export default function Navbar() {
  return (
    <header className="w-full max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
      <span className="text-xl font-bold">
        <span className="text-teal-300">Binge</span>
        <span className="text-white">Buddy</span>
      </span>
      <nav className="flex gap-3">
        <NavLink to="/get-started" className={item}>Get Started</NavLink>
        <NavLink to="/home" className={item}>Home</NavLink>
        <NavLink to="/movies" className={item}>Movies & Shows</NavLink>
        <NavLink to="/watchlist" className={item}>Watchlist</NavLink>
        <NavLink to="/subscriptions" className={item}>Subscriptions</NavLink>
        <NavLink to="/account" className={item}>Account</NavLink>

      </nav>
    </header>
  );
}
