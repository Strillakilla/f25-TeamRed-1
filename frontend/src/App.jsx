import { Routes, Route } from "react-router-dom";
import GetStarted from "./Get-StartedPage.jsx";
import Home from "./Home.jsx";
import AccountCreation from "./AccountCreation.jsx";
import Subscriptions from "./Subscriptions.jsx";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#1A093A] to-[#2D0F4E] text-slate-100">
      <Routes>
        <Route path="/" element={<GetStarted />} />
        <Route path="/" element={<Home />} />
        <Route path="/create-account" element={<AccountCreation />} />
        <Route path="/subscriptions" element={<Subscriptions />} />
      </Routes>
    </div>
  );
}