import { useNavigate } from "react-router-dom";
import logo from "../assets/bingebuddy.png";

export default function GetStarted() {
  const navigate = useNavigate();

  return (
   <section className="text-center px-6 py-16">
    <div className="max-w-2xl mx-auto rounded-3xl bg-slate-900/60 border border-white/10 p-8 shadow-xl">
       <img
    src={logo}
    alt="BingeBuddy logo"
    className="mx-auto mb-3 w-20 h-auto rounded-2xl shadow-lg"
  />
    <h1 className="text-4xl sm:text-5xl font-extrabold mb-5 tracking-tight">
    <span className="text-white">Binge</span>
    <span className="text-cyan-500">Buddy</span>
    </h1>

    <p className="text-lg text-slate-100/90 max-w-2xl mx-auto mb-4 leading-relaxed">
    Maximize your streaming experience with the ultimate companion for discovering,
    tracking, and organizing shows across every platform — all in one place.
    </p>

    <p className="text-lg text-slate-100/65 max-w-2xl mx-auto mb-8 leading-relaxed">
    Packed with <span className="text-teal-300 font-semibold"> powerful filters </span> 
    and an <span className="text-purple-300 font-semibold">intelligent chatbot </span> 
    that helps you discover what to watch next — everything you need to binge smarter,
    all with BingeBuddy.
    </p>

     <button
  onClick={() => navigate("/create-account")}
  className="px-8 py-3 rounded-full bg-gradient-to-r from-teal-400 to-purple-500
             text-white font-semibold text-lg shadow-lg 
             hover:shadow-xl hover:scale-105 active:scale-95
             focus-visible:outline-none focus-visible:ring-2 
             focus-visible:ring-offset-2 focus-visible:ring-teal-400
             transition-transform transition-shadow duration-200"
>
  Get Started
      </button>
    </div>
</section>
  );
}
