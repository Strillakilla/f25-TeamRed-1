import { useEffect, useRef, useState } from "react";
import bot from "../assets/bot.png";
import { isAuthed } from "../utils/auth";


const STORAGE_KEY = "bb.chat.v1";
const CHAT_ENDPOINT = "/api/query/classify";

/**
 * ========= PREDETERMINED RESPONSES =========
 * Hierarchy:
 *  1) Exact phrase matches
 *  2) Recommendation logic (movies / shows)
 *  3) Keyword-based rules grouped by domain (watchlist, subscriptions, filters, etc.)
 *  4) Fallback
 */

// 1) EXACT MATCH (normalized: lowercase, punctuation stripped)
const EXACT_MATCHES = {
  // General product
  "what is bingebuddy":
    "BingeBuddy helps you track everything you watch, organize titles across services, and remember where you left off.",
  "what does bingebuddy do":
    "BingeBuddy connects your watchlist, streaming services, and filters so you can spend less time searching and more time watching.",

  // Watchlist
  "how do i add to my watchlist":
    "Open the Movies & Shows page and click the “Add to Watchlist” button on any title card.",
  "how do i remove something from my watchlist":
    "Go to your Watchlist. Each title has a Remove option so you can clean things up easily.",
  "what is my watchlist":
    "Your Watchlist is your personal queue of movies and shows you want to watch later.",

  // Subscriptions
  "how do i change my subscription":
    "Open the Subscriptions tab. From there you can add, edit, or remove streaming services.",
  "how do i manage my subscriptions":
    "Head to the Subscriptions tab to manage your streaming services and plans.",
  "what services does bingebuddy support":
    "BingeBuddy is designed around major platforms like Netflix, Hulu, Prime Video, Disney+, Max, Peacock, Crunchyroll, and more.",

  // Filters / browse
  "where are filters":
    "Filters live on the Movies & Shows page. Use Quick Mode for simple filters and Advanced Mode for detailed combinations.",
  "how do i use advanced filters":
    "Switch to Advanced Mode in Movies & Shows. You can include or exclude types, services, languages, statuses, rating, year, and runtime.",
  "how do i clear all filters":
    "Use the “Clear all filters” button at the top of the Filters panel to reset everything.",

  // Account
  "how do i log out":
    "Use the Account page to sign out from BingeBuddy.",
  "how do i delete my account":
    "Account deletion is available under Account → Privacy & Controls.",

  // Help
  help:
    "I can help with watchlists, subscriptions, filters, or recommendations. Try asking me how to add to your watchlist or to recommend something to watch.",

  // Simple greetings
  "hi":
    "Hi! I’m your BingeBuddy Bot. Ask me about your watchlist, subscriptions, filters, or what to watch next.",
  "hello":
    "Hello! I can help with your watchlist, subscriptions, or recommendations.",
  "hey":
    "Hey! Ready to find something good to watch?",
};

// 2) POPULAR PICKS FOR RECOMMENDATION MOCKUP
const POPULAR_MOVIES = [
  {
    title: "Dune: Part Two",
    service: "Max or Prime Video",
    blurb:
      "a visually stunning sci-fi epic with big stakes, politics, and sandworms.",
  },
  {
    title: "Spider-Man: Across the Spider-Verse",
    service: "Netflix or Prime Video",
    blurb:
      "a stylish animated superhero film with great characters and incredible visuals.",
  },
  {
    title: "Barbie",
    service: "Max",
    blurb:
      "a bright, funny, self-aware story that mixes nostalgia with sharp humor.",
  },
  {
    title: "Oppenheimer",
    service: "Peacock",
    blurb:
      "an intense, character-driven historical drama with big performances.",
  },
];

const POPULAR_SHOWS = [
  {
    title: "Stranger Things",
    service: "Netflix",
    blurb:
      "an 80s-inspired sci-fi mystery with kids on bikes, monsters, and great music.",
  },
  {
    title: "The Bear",
    service: "Hulu",
    blurb:
      "a fast, emotional dramedy about a chef trying to rebuild a family restaurant.",
  },
  {
    title: "Succession",
    service: "Max",
    blurb:
      "a sharp, darkly funny drama about a media family constantly at war with itself.",
  },
  {
    title: "The Last of Us",
    service: "Max",
    blurb:
      "a post-apocalyptic drama focused on found family, tension, and emotional storytelling.",
  },
];

const POPULAR_ANIME = [
  {
    title: "Attack on Titan",
    service: "Crunchyroll or Hulu",
    blurb:
      "dark, intense, and full of twists if you like dramatic, story-heavy anime.",
  },
  {
    title: "Jujutsu Kaisen",
    service: "Crunchyroll",
    blurb:
      "fast-paced action with curses, powers, and a stylish modern setting.",
  },
  {
    title: "My Hero Academia",
    service: "Crunchyroll or Hulu",
    blurb:
      "a heroic, character-driven series about students training to become pro heroes.",
  },
];

const POPULAR_KIDS_FAMILY = [
  {
    title: "Moana",
    service: "Disney+",
    blurb:
      "a colorful ocean adventure with music, humor, and a strong lead hero.",
  },
  {
    title: "Encanto",
    service: "Disney+",
    blurb:
      "a magical family story with catchy songs and lots of heart.",
  },
  {
    title: "Spider-Man: Into the Spider-Verse",
    service: "Netflix or Prime Video",
    blurb:
      "fun, stylish animation that works for both kids and adults.",
  },
];

/**
 * Rule-based recommendation engine (mock “based on your watch history”)
 */
function getRecommendationReply(normalized) {
  const text = normalized;

  // Anime-leaning requests
  if (text.includes("anime")) {
    const pick =
      POPULAR_ANIME[Math.floor(Math.random() * POPULAR_ANIME.length)];
    return `Based on your recent watch history, I’d recommend “${pick.title}.” It’s ${pick.blurb} You can usually find it on ${pick.service}.`;
  }

  // Kids / family-friendly tone
  if (text.includes("kids") || text.includes("family")) {
    const pick =
      POPULAR_KIDS_FAMILY[
        Math.floor(Math.random() * POPULAR_KIDS_FAMILY.length)
      ];
    return `From your family-friendly watch history, I’d suggest “${pick.title}.” It’s ${pick.blurb} It’s typically available on ${pick.service}.`;
  }

  // Explicit movie mention
  if (text.includes("movie")) {
    const pick =
      POPULAR_MOVIES[Math.floor(Math.random() * POPULAR_MOVIES.length)];
    return `Looking at your recent watch history, a great next movie would be “${pick.title}.” It’s ${pick.blurb} You’ll usually find it on ${pick.service}.`;
  }

  // Explicit show / series mention
  if (
    text.includes("show") ||
    text.includes("series") ||
    text.includes("tv show")
  ) {
    const pick =
      POPULAR_SHOWS[Math.floor(Math.random() * POPULAR_SHOWS.length)];
    return `Based on what you’ve been watching lately, I’d recommend the series “${pick.title}.” It’s ${pick.blurb} and is typically on ${pick.service}.`;
  }

  // Generic “what should I watch” / “recommend me something”
  const all = [...POPULAR_MOVIES, ...POPULAR_SHOWS];
  const pick = all[Math.floor(Math.random() * all.length)];
  return `From your watch history, I’d line up “${pick.title}” next. It’s ${pick.blurb} You can generally stream it on ${pick.service}.`;
}

/**
 * 3) KEYWORD-BASED RULES GROUPED BY DOMAIN
 *    Each rule: { keywords: [...], reply: "..." }
 */
const KEYWORD_RULES = [
  // --- Watchlist ---
  {
    keywords: ["add", "watchlist"],
    reply:
      "To add something to your Watchlist, open Movies & Shows and click the “Add to Watchlist” button on any title.",
  },
  {
    keywords: ["remove", "watchlist"],
    reply:
      "Open your Watchlist page and use the Remove option on any title to clean it up.",
  },
  {
    keywords: ["organize", "watchlist"],
    reply:
      "Right now the Watchlist is a simple list, but you can filter by type, year, or rating from the Movies & Shows page to help you decide what to watch next.",
  },

  // --- Subscriptions ---
  {
    keywords: ["subscription", "manage"],
    reply:
      "Use the Subscriptions tab to add or edit your streaming services and track where your content lives.",
  },
  {
    keywords: ["subscription", "cancel"],
    reply:
      "You can adjust or remove services under the Subscriptions tab. BingeBuddy itself doesn’t cancel billing with providers, but it helps you track them.",
  },

  // --- Filters / browse ---
  {
    keywords: ["filter", "genre"],
    reply:
      "On Movies & Shows, use the Genre dropdown to focus on categories like Comedy, Drama, Horror, or Anime.",
  },
  {
    keywords: ["filter", "year"],
    reply:
      "Use the Year range inputs to find titles from a specific time window, like 2010–2020.",
  },
  {
    keywords: ["filter", "language"],
    reply:
      "Use the Language dropdown in Quick or Advanced Mode to filter for English, Spanish, Japanese, Korean, and more.",
  },
  {
    keywords: ["filter", "runtime"],
    reply:
      "Runtime filters let you pick shorter episodes or longer movies. Use the min/max runtime inputs in Advanced Mode.",
  },
  {
    keywords: ["sort", "results"],
    reply:
      "The Sort menu lets you order results by relevance, rating, or release year.",
  },

  // --- Account / login ---
  {
    keywords: ["login", "help"],
    reply:
      "If login isn’t working, check your email and password, or use the Forgot Password option. Also make sure your browser isn’t blocking cookies.",
  },
  {
    keywords: ["account", "settings"],
    reply:
      "You can manage your profile under the Account page, including basic info and privacy controls.",
  },

  // --- General “where is it streaming” ---
  {
    keywords: ["where", "streaming"],
    reply:
      "Open the Details view for a title and scroll to Watch Providers. BingeBuddy shows where it’s currently streaming by region.",
  },

  // --- Small talk / polite ---
  {
    keywords: ["thank"],
    reply:
      "You’re welcome! If you want, I can also suggest something to watch next.",
  },
];

/**
 * 4) DEFAULT REPLY
 */
const DEFAULT_REPLY =
  "I can help with watchlists, subscriptions, filters, and recommendations. Try asking me to recommend a movie or show, or how to use filters.";

/**
 * Main reply dispatcher
 */
function getMockReply(text) {
  // Normalize user text
  const normalized = text.toLowerCase();
  const stripped = normalized.replace(/[?.!,]/g, "").trim();

  // 1) Exact match
  if (EXACT_MATCHES[stripped]) {
    return EXACT_MATCHES[stripped];
  }

  // 2) Recommendation-style prompt
  if (
    normalized.includes("recommend") ||
    normalized.includes("what should i watch") ||
    normalized.includes("suggest something") ||
    normalized.includes("pick something") ||
    normalized.includes("give me something to watch")
  ) {
    return getRecommendationReply(normalized);
  }

  // 3) Keyword rules (all keywords in the rule must be present)
  for (const rule of KEYWORD_RULES) {
    const hit = rule.keywords.every((kw) => normalized.includes(kw));
    if (hit) return rule.reply;
  }

  // 4) Fallback
  return DEFAULT_REPLY;
}

// 🔹 Call backend AI (Spring QueryController → ChatbotService)
async function callBackendChat(text) {
  try {
    const token = localStorage.getItem("bb.jwt");

    const headers = {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${token}`
    };


    // Log what we're about to send (no raw token)
    console.log("Chatbot request:", {
      url: 'http://localhost:8080/api/query/classify',
      body: { query: text },
      hasToken: !!token,
      isAuthedFrontend: isAuthed(),
    });

    const res = await fetch('http://localhost:8080/api/query/classify', {
      method: "POST",
      headers,
      body: JSON.stringify({ query: text }), // backend expects { query: "..." }
    });

    console.log("Chatbot response status:", res.status);

    // Read raw text so we can always log it
    const rawText = await res.text();
    console.log("Chatbot raw response body:", rawText);

    // Auth failure or other error
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        window.dispatchEvent(new Event("auth:expired"));
      }
      console.error("Chatbot HTTP error:", res.status, rawText);
      throw new Error(`HTTP ${res.status}`);
    }

    // Try to parse JSON
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      console.error("Failed to parse JSON from chatbot:", e);
      return DEFAULT_REPLY;
    }

    console.log("Chatbot parsed JSON:", data);

    // Case 1: wired to ChatbotService.handle(...)
    // { success: true/false, message: string, results: [...], count: number }
    if (typeof data.success === "boolean") {
      if (data.success) {
        const base = data.message || "Here are some results:";
        const list = Array.isArray(data.results)
          ? data.results.map((item, index) => `${index + 1}. ${item}`).join("\n")
          : "";
        return list ? `${base}\n${list}` : base;
      }
      return data.message || DEFAULT_REPLY;
    }

    // Case 2: classify endpoint returns intent-only object
    // e.g. { isValid, type, genre, sort, count, region, message }
    if (typeof data.message === "string") {
      return data.message;
    }

    // Fallback if shape is unexpected
    return DEFAULT_REPLY;
  } catch (err) {
    console.error("Chatbot backend error (falling back to rules):", err);
    return getMockReply(text);
  }
}



/**
 * ========== COMPONENT ========== 
 */
export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const listRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text) return;

    const userMsg = {
      id: crypto.randomUUID(),
      role: "user",
      text,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // 🔹 Ask backend (with fallback to local rules)
    const replyText = await callBackendChat(text);

    const botMsg = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: replyText,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, botMsg]);
  }


  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-white/10 backdrop-blur
                   border border-white/15 px-3 py-2 hover:bg-white/20 transition"
      >
        <img
          src={bot}
          alt="BingeBuddy Bot"
          className="h-8 w-8 rounded-full object-cover"
        />
        <span className="hidden sm:inline text-sm text-white">Chat</span>
      </button>

      {open && (
        <div
          className="fixed bottom-20 left-4 z-50 w-[90vw] max-w-sm rounded-2xl overflow-hidden
                        bg-[#0b0b12]/95 border border-white/10 shadow-2xl"
        >
          <div className="flex items-center gap-3 px-3 py-2 bg-white/5 border-b border-white/10">
            <img
              src={bot}
              alt="BingeBuddy Bot"
              className="h-8 w-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">
                BingeBuddy Bot
              </div>
              <div className="text-[11px] text-slate-300">
                Ask me about your streaming
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-300 hover:text-white text-sm px-2 py-1"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div
            ref={listRef}
            className="max-h-80 overflow-y-auto p-3 space-y-2"
          >
            {messages.length === 0 ? (
              <div className="text-xs text-slate-300/80">
                Hi! I can help you add items to your Watchlist, manage
                Subscriptions, use filters, or recommend something to watch.
                Try typing: “Recommend me a movie.”
              </div>
            ) : (
              messages.map((m) => (
                <Message key={m.id} role={m.role} text={m.text} />
              ))
            )}
          </div>

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
        className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed whitespace-pre-line
          ${
            isUser
              ? "bg-teal-500/20 text-teal-100"
              : "bg-white/10 text-white"
          }`}
      >
        {text}
      </div>
    </div>
  );
}
