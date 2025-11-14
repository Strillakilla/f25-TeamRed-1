// src/App.jsx
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/Navbar.jsx";
import AdRails from "./components/AdRails.jsx";
import Footer from "./components/Footer.jsx";
import ChatbotWidget from "./components/ChatbotWidget.jsx";

import GetStarted from "./Pages/Get-StartedPage.jsx";
import Home from "./Pages/Home.jsx";
import AccountCreation from "./Pages/AccountChoice.jsx";
import CreateAccountForm from "./Pages/CreateAccountForm.jsx";
import Login from "./Pages/Login.jsx";
import Subscriptions from "./Pages/Subscriptions.jsx";
import Watchlist from "./Pages/Watchlist.jsx";
import MoviesShows from "./Pages/MoviesShows.jsx";
import Account from "./Pages/Account.jsx";
import ForgotPassword from "./Pages/ForgotPassword.jsx";
import Security from "./Pages/Security.jsx";
import Details from "./Pages/Details.jsx";

import AppLayout from "./layout/AppLayout";
import { RequireAuth, RequireAnon } from "./route-guards";
import { isAuthed, onAuthExpired } from "./utils/auth";

export default function App() {
  const { pathname } = useLocation();
  const showNavbar = pathname !== "/get-started";

  // optional: boot-time invalid token cleanup
  useEffect(() => {
    const cleanup = onAuthExpired(() => {
      localStorage.removeItem("bb.jwt");
      window.location.replace("/login");
    });
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#1A093A] to-[#2D0F4E] text-slate-100">
      {showNavbar && <Navbar />}

      {/* Wrap ALL routes in AppLayout so ad rails show around pages */}
      <Routes>
        <Route element={<AppLayout />}>
          {/* default landing */}
          <Route
            path="/"
            element={<Navigate to={isAuthed() ? "/home" : "/get-started"} replace />}
          />

          {/* PUBLIC (anon-only) */}
          <Route element={<RequireAnon />}>
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/create-account" element={<AccountCreation />} />
            <Route path="/create-account-form" element={<CreateAccountForm />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* PROTECTED (auth-only) */}
          <Route element={<RequireAuth />}>
            <Route path="/home" element={<Home />} />
            <Route path="/account" element={<Account />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/movies" element={<MoviesShows />} />
            <Route path="/security" element={<Security />} />
            <Route path="/details/:type/:id" element={<Details />} />
          </Route>

          {/* catch-all */}
          <Route
            path="*"
            element={<Navigate to={isAuthed() ? "/home" : "/get-started"} replace />}
          />
        </Route>
      </Routes>

      {pathname !== "/get-started" && <ChatbotWidget />}
      <Footer />
    </div>
  );
}
