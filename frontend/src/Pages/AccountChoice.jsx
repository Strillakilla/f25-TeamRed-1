import { useNavigate } from "react-router-dom";

export default function AccountCreation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-3xl font-bold mb-6 text-cyan-400">
        Welcome to BingeBuddy
      </h1>

      <div className="bg-black/40 border border-white/10 rounded-2xl p-8 w-full max-w-md space-y-6">
        <p className="text-slate-200">
          Choose how you want to get started.
        </p>

        {/* CREATE ACCOUNT */}
        <button
          onClick={() => navigate("/create-account-form")}
          className="w-full px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600
                     text-white font-semibold text-lg shadow-lg hover:opacity-90 transition duration-200"
        >
          Create an Account
        </button>

        {/* LOGIN */}
        <button
          onClick={() => navigate("/login")}
          className="w-full px-8 py-3 rounded-full bg-white/10 text-white font-semibold 
                     text-lg shadow-lg hover:bg-white/20 transition duration-200"
        >
          Log In
        </button>
      </div>
    </div>
  );
}
