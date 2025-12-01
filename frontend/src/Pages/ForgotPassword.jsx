import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) return;

    // Frontend-only behavior: pretend we sent the email
    setSubmitted(true);

    setTimeout(() => {
      navigate("/login");
    }, 2500);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-bold text-cyan-400 mb-4">
          Reset Link Sent!
        </h1>
        <p className="text-slate-200 max-w-md">
          If this email is registered, you'll receive a password reset link shortly.
        </p>
        <p className="mt-6 text-sm text-slate-400">Redirecting to login…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold mb-4 text-cyan-400">Forgot Password</h1>

      <div className="bg-black/40 border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <p className="mb-6 text-slate-200">
          Enter your email and we’ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-white/90 text-gray-900 outline-none 
                       border border-transparent focus:border-cyan-500"
            required
          />

          <button
            type="submit"
            className="w-full px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600
                       text-white font-semibold text-lg hover:opacity-90 transition"
          >
            Send Reset Link
          </button>
        </form>

        <button
          onClick={() => navigate("/login")}
          className="mt-4 text-sm text-slate-300 hover:text-white"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
