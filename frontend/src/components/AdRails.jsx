// src/components/AdRails.jsx

export default function AdRails({ position }) {
  return (
    <div
      className="
        pointer-events-auto
        flex flex-col items-center justify-center
        w-[70px] h-[180px]        /* smaller */
        rounded-xl
        bg-gradient-to-b from-slate-800/80 to-slate-900/80   /* darker + softer */
        border border-white/10
        shadow-lg
        backdrop-blur-sm
        text-center text-white
      "
    >
      <div className="w-8 h-8 rounded-full bg-white/10 mb-2 flex items-center justify-center">
        <span className="text-lg">
          {position === "left" ? "🎬" : "🍿"}
        </span>
      </div>

      <p className="text-[11px] font-semibold mb-1 opacity-90">
        Ad
      </p>

      <p className="text-[9px] opacity-60 px-2 leading-tight">
        Placeholder space
      </p>
    </div>
  );
}