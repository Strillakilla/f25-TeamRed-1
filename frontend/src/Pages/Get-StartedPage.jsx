import { useNavigate } from "react-router-dom";

export default function GetStarted() {
  const navigate = useNavigate();

  return (
    <section className="text-center px-6 py-12">
      <h1 className="text-5xl font-extrabold mb-4">
        <span className="text-teal-300">Binge</span>
        <span className="text-fuchsia-300">Buddy</span>
      </h1>

      <p className="text-lg text-slate-100/85 max-w-2xl mx-auto mb-8 leading-relaxed">
        The ultimate streaming companion. Track, organize, and discover shows and
        movies across every platform — all in one place.
      </p>

      <button
        onClick={() => navigate("/create-account")}
        className="px-8 py-3 rounded-full bg-gradient-to-r from-teal-400 to-purple-600
                   text-white font-semibold text-lg shadow-lg
                   hover:shadow-fuchsia-500/50 hover:scale-105 active:scale-95
                   transition-transform duration-200"
      >
        Get Started
      </button>

    </section>
  );
}
