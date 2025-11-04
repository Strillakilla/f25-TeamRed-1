import { useEffect, useMemo, useState } from "react";
import { STREAMING_SERVICES } from "../data/services.js";

const STORAGE_KEY = "bb.subscriptions.v1";

export default function Subscriptions() {
  // ---------- state ----------
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const [form, setForm] = useState({
    id: null,
    name: "",
    plan: "",
    price: "",
    cycle: "Monthly", // Monthly | Yearly
    nextDate: "",     // yyyy-mm-dd
    status: "Active", // Active | Paused | Canceled
  });
  const [editingId, setEditingId] = useState(null);
  const [sortKey, setSortKey] = useState("nextDate"); // name | nextDate | monthly
  const [sortDir, setSortDir] = useState("asc");      // asc | desc
  const [view, setView] = useState("cards");          // cards | table
  const [filter, setFilter] = useState("All");        // All | Active | Paused | Canceled

  // ---------- effects ----------
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // ---------- helpers ----------
  const monthlyValue = (it) =>
    it.cycle === "Yearly" ? Number(it.price || 0) / 12 : Number(it.price || 0);

  const currency = (n) =>
    isFinite(n) ? n.toLocaleString(undefined, { style: "currency", currency: "USD" }) : "$0.00";

  const fmtDate = (d) => (d ? new Date(d + "T00:00:00").toLocaleDateString() : "—");

  const normalized = useMemo(() => {
    let list = items
      .map((it) => ({ ...it, monthly: monthlyValue(it) }))
      .filter((it) => (filter === "All" ? true : it.status === filter));

    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
      if (sortKey === "monthly") return (a.monthly - b.monthly) * dir;
      // nextDate empty goes to bottom in asc, top in desc
      const ad = a.nextDate ? new Date(a.nextDate).getTime() : (sortDir === "asc" ? Infinity : -Infinity);
      const bd = b.nextDate ? new Date(b.nextDate).getTime() : (sortDir === "asc" ? Infinity : -Infinity);
      return (ad - bd) * dir;
    });

    return list;
  }, [items, sortKey, sortDir, filter]);

  const monthlyTotal = useMemo(
    () => normalized.reduce((sum, it) => sum + it.monthly, 0),
    [normalized]
  );

  // ---------- actions ----------
  function resetForm() {
    setForm({
      id: null,
      name: "",
      plan: "",
      price: "",
      cycle: "Monthly",
      nextDate: "",
      status: "Active",
    });
    setEditingId(null);
  }

  function onEdit(it) {
    setForm({
      id: it.id,
      name: it.name,
      plan: it.plan || "",
      price: String(it.price ?? ""),
      cycle: it.cycle || "Monthly",
      nextDate: it.nextDate || "",
      status: it.status || "Active",
    });
    setEditingId(it.id);
  }

  function onDelete(id) {
    setItems((prev) => prev.filter((x) => x.id !== id));
    if (editingId === id) resetForm();
  }

  function onPauseResume(it) {
    const next =
      it.status === "Active" ? "Paused" :
      it.status === "Paused" ? "Active" :
      "Active";
    setItems((prev) => prev.map((x) => (x.id === it.id ? { ...x, status: next } : x)));
  }

  function onSubmit(e) {
    e.preventDefault();

    const priceNum = Number(form.price);
    if (!form.name.trim()) return;
    if (!isFinite(priceNum) || priceNum < 0) return;

    const payload = {
      id: form.id ?? crypto.randomUUID(),
      name: form.name.trim(),
      plan: form.plan.trim(),
      price: Math.round(priceNum * 100) / 100, // normalize to 2 decimals
      cycle: form.cycle,
      nextDate: form.nextDate || "",
      status: form.status,
    };

    setItems((prev) => {
      const exists = prev.some((x) => x.id === payload.id);
      return exists ? prev.map((x) => (x.id === payload.id ? payload : x)) : [payload, ...prev];
    });

    resetForm();
  }

  // ---------- UI ----------
  return (
    <div className="min-h-[70vh] space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Subscriptions</h1>
          <p className="text-slate-200">
            Track price, billing cycle, and next renewal. Data stays on this device.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10">
            <div className="text-xs text-slate-300">Monthly total</div>
            <div className="text-xl font-semibold">{currency(monthlyTotal)}</div>
          </div>

          <select
            className="px-3 py-2 rounded-md bg-white/10 text-white border border-white/10"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            title="Filter by status"
          >
            <option>All</option>
            <option>Active</option>
            <option>Paused</option>
            <option>Canceled</option>
          </select>

          <select
            className="px-3 py-2 rounded-md bg-white/10 text-white border border-white/10"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            title="Sort by"
          >
            <option value="nextDate">Next billing</option>
            <option value="name">Name</option>
            <option value="monthly">Monthly cost</option>
          </select>

          <button
            className="px-3 py-2 rounded-md bg-white/10 text-white border border-white/10"
            onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
            title="Toggle sort direction"
          >
            {sortDir === "asc" ? "↑" : "↓"}
          </button>

          <button
            className={`px-3 py-2 rounded-md border border-white/10 ${
              view === "cards" ? "bg-white/20" : "bg-white/10"
            }`}
            onClick={() => setView("cards")}
          >
            Cards
          </button>
          <button
            className={`px-3 py-2 rounded-md border border-white/10 ${
              view === "table" ? "bg-white/20" : "bg-white/10"
            }`}
            onClick={() => setView("table")}
          >
            Table
          </button>
        </div>
      </header>

{/* Add/Edit form */}
<section className="bg-black/40 border border-white/10 rounded-2xl p-5">
  <h2 className="text-lg font-semibold mb-4">
    {editingId ? "Edit subscription" : "Add a subscription"}
  </h2>

  <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

    {/* Service dropdown */}
    <label className="block">
      <div className="text-sm mb-1">Streaming Service *</div>
      <select
        value={form.name}
        onChange={(e) => {
          const service = e.target.value;
          setForm((f) => ({
            ...f,
            name: service,
            plan: "",
            price: ""
          }));
        }}
        className="w-full rounded-md px-3 py-2 bg-white/90 text-gray-900 outline-none border border-transparent focus:border-teal-400"
      >
        <option value="">Choose a service</option>
        {Object.keys(STREAMING_SERVICES).map((service) => (
          <option key={service} value={service}>{service}</option>
        ))}
        <option value="Other">Other (manual entry)</option>
      </select>
    </label>

    {/* Plan dropdown (depends on service) */}
    <label className="block">
      <div className="text-sm mb-1">Plan *</div>
      {/* If "Other" is selected → use a text input */}
  {form.name === "Other" ? (
    <input
      type="text"
      placeholder="Enter plan name"
      value={form.plan}
      onChange={(e) =>
        setForm((f) => ({ ...f, plan: e.target.value }))
      }
      className="w-full rounded-md px-3 py-2 bg-white/90 text-gray-900 outline-none border border-transparent focus:border-teal-400"
    />
  ) : (
    /* Otherwise → show normal dropdown */
      <select
        value={form.plan}
        onChange={(e) => {
          const planName = e.target.value;
          const plan = STREAMING_SERVICES[form.name]?.plans.find(p => p.name === planName);

          setForm((f) => ({
            ...f,
            plan: planName,
            price: plan?.price || ""
          }));
        }}
        disabled={!form.name}
        className="w-full rounded-md px-3 py-2 bg-white/90 text-gray-900 outline-none border border-transparent focus:border-teal-400 disabled:bg-white/40 disabled:cursor-not-allowed"
      >
        <option value="">{form.name ? "Choose a plan" : "Select a service first"}</option>
        {form.name &&
          STREAMING_SERVICES[form.name].plans.map((p) => (
            <option key={p.name} value={p.name}>{p.name} — ${p.price}</option>
          ))}
      </select>
  )}
    </label>

    {/* Price auto fills */}
    <label className="block">
  <div className="text-sm mb-1">Price *</div>
    <input
    type="number"
    step="0.01"
    value={form.price}
   onChange={(e) =>
     setForm((f) => ({ ...f, price: e.target.value }))
   }
    disabled={form.name !== "Other"}
   className={`w-full rounded-md px-3 py-2 bg-white/90 text-gray-900 outline-none border border-transparent focus:border-teal-400
      ${form.name !== "Other" ? "bg-white/60 text-gray-700 cursor-not-allowed" : ""}`}
      />
    </label>

    {/* Billing cycle */}
    <label className="block">
      <div className="text-sm mb-1">Billing cycle *</div>
      <select
        value={form.cycle}
        onChange={(e) => setForm((f) => ({ ...f, cycle: e.target.value }))}
        className="w-full rounded-md px-3 py-2 bg-white/90 text-gray-900 outline-none border border-transparent focus:border-teal-400"
      >
        <option>Monthly</option>
        <option>Yearly</option>
      </select>
    </label>

    {/* Next billing date */}
    <label className="block">
      <div className="text-sm mb-1">Next billing date</div>
      <input
        type="date"
        value={form.nextDate}
        onChange={(e) => setForm((f) => ({ ...f, nextDate: e.target.value }))}
        className="w-full rounded-md px-3 py-2 bg-white/90 text-gray-900 outline-none border border-transparent focus:border-teal-400"
      />
    </label>

    {/* Status */}
    <label className="block">
      <div className="text-sm mb-1">Status</div>
      <select
        value={form.status}
        onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
        className="w-full rounded-md px-3 py-2 bg-white/90 text-gray-900 outline-none border border-transparent focus:border-teal-400"
      >
        <option>Active</option>
        <option>Paused</option>
        <option>Canceled</option>
      </select>
    </label>

    {/* Form buttons */}
    <div className="flex gap-3 sm:col-span-2 lg:col-span-3">
      <button
        type="submit"
        className="px-5 py-2 rounded-full bg-gradient-to-r from-teal-400 to-purple-600 text-white font-semibold hover:opacity-90 transition"
      >
        {editingId ? "Save changes" : "Add subscription"}
      </button>
      {editingId && (
        <button
          type="button"
          className="px-5 py-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition"
          onClick={resetForm}
        >
          Cancel
        </button>
      )}
    </div>
  </form>
</section>

      {/* Cards view */}
      {view === "cards" && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {normalized.length === 0 ? (
            <Empty />
          ) : (
            normalized.map((it) => (
              <article
                key={it.id}
                className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold">{it.name}</div>
                    <div className="text-xs text-slate-300">
                      {it.plan || "—"} • {it.cycle}
                    </div>
                  </div>
                  <StatusBadge status={it.status} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-300">Price</div>
                  <div className="font-semibold">{currency(it.price)}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-300">Monthly equiv.</div>
                  <div className="font-semibold">{currency(monthlyValue(it))}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-300">Next billing</div>
                  <div className="font-semibold">{fmtDate(it.nextDate)}</div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    className="px-3 py-1 text-sm rounded-md bg-white/10 hover:bg-white/20"
                    onClick={() => onEdit(it)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1 text-sm rounded-md bg-white/10 hover:bg-white/20"
                    onClick={() => onPauseResume(it)}
                  >
                    {it.status === "Paused" ? "Resume" : "Pause"}
                  </button>
                  <button
                    className="ml-auto px-3 py-1 text-sm rounded-md text-red-300 hover:text-red-200"
                    onClick={() => onDelete(it.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      )}

      {/* Table view */}
      {view === "table" && (
        <section className="bg-white/5 border border-white/10 rounded-xl overflow-x-auto">
          {normalized.length === 0 ? (
            <Empty />
          ) : (
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-300">
                <tr>
                  <Th label="Name" onSort={() => setSortKey("name")} active={sortKey === "name"} dir={sortDir} />
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Cycle</th>
                  <Th label="Price" />
                  <Th label="Monthly" onSort={() => setSortKey("monthly")} active={sortKey === "monthly"} dir={sortDir} />
                  <Th
                    label="Next billing"
                    onSort={() => setSortKey("nextDate")}
                    active={sortKey === "nextDate"}
                    dir={sortDir}
                  />
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {normalized.map((it) => (
                  <tr key={it.id} className="text-slate-100/90">
                    <td className="px-4 py-3 font-medium">{it.name}</td>
                    <td className="px-4 py-3">{it.plan || "—"}</td>
                    <td className="px-4 py-3">{it.cycle}</td>
                    <td className="px-4 py-3">{currency(it.price)}</td>
                    <td className="px-4 py-3">{currency(it.monthly)}</td>
                    <td className="px-4 py-3">{fmtDate(it.nextDate)}</td>
                    <td className="px-4 py-3"><StatusBadge status={it.status} /></td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20"
                        onClick={() => onEdit(it)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 rounded-md bg-white/10 hover:bg-white/20"
                        onClick={() => onPauseResume(it)}
                      >
                        {it.status === "Paused" ? "Resume" : "Pause"}
                      </button>
                      <button
                        className="px-3 py-1 rounded-md text-red-300 hover:text-red-200"
                        onClick={() => onDelete(it.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
}

/* ---------------- subcomponents ---------------- */

function Input({ label, ...props }) {
  return (
    <label className="block">
      <div className="text-sm mb-1">{label}</div>
      <input
        {...props}
        className={`w-full rounded-md px-3 py-2 bg-white/90 text-gray-900 outline-none border border-transparent focus:border-teal-400 ${props.className || ""}`}
      />
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="block">
      <div className="text-sm mb-1">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md px-3 py-2 bg-white/90 text-gray-900 outline-none border border-transparent focus:border-teal-400"
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </label>
  );
}

function StatusBadge({ status }) {
  const style =
    status === "Active"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      : status === "Paused"
      ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      : "bg-red-500/20 text-red-300 border-red-500/30";
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs border ${style}`}>
      {status}
    </span>
  );
}

function Th({ label, onSort, active, dir }) {
  return (
    <th className="px-4 py-3">
      <button
        type="button"
        className={`inline-flex items-center gap-1 ${active ? "text-white" : "text-slate-300"}`}
        onClick={onSort}
      >
        {label}
        {onSort && <span className="text-xs">{active ? (dir === "asc" ? "↑" : "↓") : ""}</span>}
      </button>
    </th>
  );
}

function Empty() {
  return (
    <div className="border border-white/10 rounded-xl p-6 text-center text-slate-300">
      No subscriptions yet. Add one above.
    </div>
  );
}
