// frontend/src/App.jsx
export default function App() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-fuchsia-700 via-pink-500 to-rose-400 text-white">
      {/* Decorative glow layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.15),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.2),transparent_60%)]"></div>

      {/* Content */}
      <main className="relative z-10 text-center px-6 space-y-6 max-w-2xl">
        <h1 className="text-7xl md:text-8xl font-extrabold tracking-tight drop-shadow-2xl">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-200 via-white to-pink-200">
            BingeBuddy
          </span>
        </h1>

        <p className="text-lg md:text-xl text-pink-100 leading-relaxed">
          The ultimate streaming companion. Track, organize, and discover shows and movies across every platform — all in one place.
        </p>

        <button className="px-8 py-3 rounded-full bg-white text-fuchsia-700 font-semibold text-lg shadow-lg hover:scale-105 hover:bg-pink-50 transition-transform duration-200">
          Get Started
        </button>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-4 text-sm text-pink-200/80">
        © {new Date().getFullYear()} BingeBuddy • All rights reserved
      </footer>
    </div>
  );
}
