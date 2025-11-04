import { useNavigate } from "react-router-dom";

export default function AccountCreation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-3xl font-bold mb-4 text-teal-300">
        Create Your BingeBuddy Account
      </h1>

      <div className="bg-black/40 border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <p className="mb-6 text-slate-200">
          (For now you don’t need to enter anything — click below to continue.)
        </p>

        <button
          onClick={() => navigate("/subscriptions")}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-teal-400 to-purple-600
                     text-white font-semibold text-lg shadow-lg hover:opacity-90
                     transition duration-200"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}