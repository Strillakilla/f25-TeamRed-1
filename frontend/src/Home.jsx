
import logo from "./assets/bingebuddy-logo.png";

export default function Home() {
  return (
    
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-800 via-fuchsia-800 to-purple-900 text-white text-center px-6">

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]">
        Binge<span className="text-fuchsia-300">Buddy</span>
      </h1>

      {/* Description */}
      <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-8 leading-relaxed">
        The ultimate streaming companion. Track, organize, and discover shows
        and movies across every platform — all in one place.
      </p>

      {/* Button */}
      <button
        className="px-8 py-3 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-semibold text-lg shadow-lg hover:scale-105 hover:shadow-fuchsia-500/50 transition-transform duration-300"
      >
        Get Started
      </button>

      {/* Footer */}
      <footer className="absolute bottom-4 text-sm text-white/60">
        © {new Date().getFullYear()} BingeBuddy • All rights reserved
      </footer>
    </div>
  );
}