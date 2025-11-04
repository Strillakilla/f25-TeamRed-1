import { useNavigate } from "react-router-dom";

export default function CreateAccountForm() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-3xl font-bold mb-6 text-teal-300">
        Create Your Account
      </h1>

      <div className="bg-black/40 border border-white/10 rounded-2xl p-6 w-full max-w-md space-y-6">
        <p className="text-slate-200">(Form coming soon)</p>

        <button
          onClick={() => navigate("/subscriptions")}
          className="w-full px-8 py-3 rounded-full bg-gradient-to-r from-teal-400 to-purple-600
                     text-white font-semibold text-lg shadow-lg hover:opacity-90 transition duration-200"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
