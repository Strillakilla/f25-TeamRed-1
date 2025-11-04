import { useNavigate } from "react-router-dom";

export default function GetStarted() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-5xl font-extrabold mb-4">
        <span className="text-teal-300">Binge</span>
        <span className="text-fuchsia-300">Buddy</span>
      </h1>

      <p className="text-lg text-slate-200 max-w-2xl mx-auto mb-8 leading-relaxed">
        The ultimate streaming companion. Track, organize, and discover shows and
        movies across every platform — all in one place.
      </p>

      <button
        onClick={() => navigate("/create-account")}
        className="px-8 py-3 rounded-full bg-gradient-to-r from-teal-400 to-purple-600
                   text-white font-semibold text-lg shadow-lg hover:opacity-90
                   transition duration-200"
      >
        Get Started
      </button>

      <p className="mt-10 text-xs text-slate-300">
        © {new Date().getFullYear()} BingeBuddy • All rights reserved
      </p>
    </div>
  );
}