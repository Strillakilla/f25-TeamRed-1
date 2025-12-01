// src/components/AdRails.jsx
export default function AdRails() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-between pointer-events-none">
      {/* LEFT */}
      <div className="ml-4">
        <div
          className="
            pointer-events-auto
            w-[180px] h-[600px]
            bg-slate-900/70 border-2 border-dashed border-teal-400
            rounded-xl shadow-xl backdrop-blur-sm
            flex items-center justify-center text-center
            text-sm text-teal-200 font-semibold
          "
          title="Ad slot: 160×600 – Place your ad here"
        >
          Place your ad here
          <div className="text-[11px] text-slate-300 mt-1">160×600</div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="mr-4">
        <div
          className="
            pointer-events-auto
            w-[180px] h-[600px]
            bg-slate-900/70 border-2 border-dashed border-teal-400
            rounded-xl shadow-xl backdrop-blur-sm
            flex items-center justify-center text-center
            text-sm text-teal-200 font-semibold
          "
          title="Ad slot: 160×600 – Promote your business"
        >
          Promote your business
          <div className="text-[11px] text-slate-300 mt-1">160×600</div>
        </div>
      </div>
    </div>
  );
}
