export default function Subscriptions() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation bar only on inner pages */}
      <header className="w-full max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <span className="text-xl font-bold">
          <span className="text-teal-300">Binge</span>
          <span className="text-white-300">Buddy</span>
        </span>

        <nav className="flex gap-6 text-sm text-slate-100/80">
          <span>Home</span>
          <span>Movies &amp; Shows</span>
          <span>Watchlist</span>
          <span className="font-semibold text-teal-300">Subscriptions</span>
        </nav>
      </header>

      {/* Page content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Subscriptions</h1>
        <p className="text-slate-200 max-w-xl">
          Here you’ll be able to track all of your streaming subscriptions in one place.
        </p>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-100/60">
        © {new Date().getFullYear()} BingeBuddy • All rights reserved
      </footer>
    </div>
  );
}