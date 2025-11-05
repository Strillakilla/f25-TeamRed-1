import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "bb.chat.v1";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  });
  const listRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    // autoscroll
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  function send() {
    const text = input.trim();
    if (!text) return;
    const userMsg = { id: crypto.randomUUID(), role: "user", text, ts: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Mock assistant reply (replace with real API later)
    setTimeout(() => {
      const botMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: mockReply(text),
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 400);
  }

  function mockReply(text) {
    // Tiny demo logic — customize as you like
    if (/watchlist/i.test(text)) {
      return "Want to add something to your Watchlist? Try the Watchlist page.";
    }
    if (/subscription/i.test(text)) {
      return "Subscriptions live under the Subscriptions tab. You can add or edit plans there.";
    }
    return "I’m your BingeBuddy! Ask me about watchlists, subscriptions, or what to watch next.";
  }

  return (
    <>
      {/* Toggle Button (bottom-left) */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-white/10 backdrop-blur
                   border border-white/15 px-3 py-2 hover:bg-white/20 transition"
      >
        <img
          src="/src/assets/bot.png"
          alt="BingeBuddy Bot"
          className="h-8 w-8 rounded-full object-cover"
        />
        <span className="hidden sm:inline text-sm text-white">Chat</span>
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-20 left-4 z-50 w-[90vw] max-w-sm rounded-2xl overflow-hidden
                     bg-[#0b0b12]/95 border border-white/10 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-3 py-2 bg-white/5 border-b border-white/10">
            <img
              src="/src/assets/bot.png"
              alt="BingeBuddy Bot"
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">BingeBuddy Bot</div>
              <div className="text-[11px] text-slate-300">Ask me about your streaming</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-300 hover:text-white text-sm px-2 py-1"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div
            ref={listRef}
            className="max-h-80 overflow-y-auto p-3 space-y-2"
          >
            {messages.length === 0 ? (
              <div className="text-xs text-slate-300/80">
                Hi! I can help you add items to your Watchlist, manage Subscriptions,
                or suggest something to watch.
              </div>
            ) : (
              messages.map((m) => (
                <Message key={m.id} role={m.role} text={m.text} />
              ))
            )}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 p-3 border-t border-white/10">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask me anything..."
              className="flex-1 rounded-lg bg-white/10 text-white placeholder:text-slate-400
                         px-3 py-2 outline-none border border-white/10 focus:border-teal-400"
            />
            <button
              onClick={send}
              className="px-3 py-2 rounded-lg bg-gradient-to-r from-teal-400 to-purple-600
                         text-white font-medium hover:opacity-90 transition"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Message({ role, text }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed
          ${isUser ? "bg-teal-500/20 text-teal-100" : "bg-white/10 text-white"}`}
      >
        {text}
      </div>
    </div>
  );
}
