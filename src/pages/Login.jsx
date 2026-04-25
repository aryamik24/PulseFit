import { useState, useEffect } from "react";
import { signIn } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../services/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) navigate("/");
    };
    checkUser();
  }, []);

  const handleLogin = async () => {
    const { error } = await signIn(email, password);
    if (error) alert(error.message);
    else navigate("/");
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#f7f7f8]">

      {/* LEFT PANEL */}
      <div className="hidden md:flex flex-col justify-center px-24 bg-black text-white relative overflow-hidden">

        {/* subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />

        <div className="relative z-10 max-w-sm">
          <h1 className="text-5xl font-semibold tracking-tight mb-4">
            PulseFit
          </h1>

          <p className="text-gray-400 leading-relaxed">
            Build discipline. Track progress.  
            Become consistent.
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex items-center justify-center px-6">

        <div className="w-full max-w-md">

          {/* GLOW */}
          <div className="absolute inset-0 -z-10 blur-2xl opacity-20 bg-gradient-to-r from-black to-gray-400 rounded-full" />

          {/* CARD */}
          <div className="bg-white border border-gray-200 rounded-2xl p-10 shadow-lg">

            {/* HEADER */}
            <div className="mb-6">
              <h2 className="text-3xl font-semibold tracking-tight">
                Welcome back
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Sign in to continue
              </p>
            </div>

            {/* INPUTS */}
            <div className="space-y-4">

              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10"
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10"
                onChange={(e) => setPassword(e.target.value)}
              />

            </div>

            {/* BUTTON */}
            <button
              onClick={handleLogin}
              className="w-full mt-6 py-3 rounded-xl bg-black text-white font-medium hover:opacity-90 transition"
            >
              Sign in
            </button>

            {/* DIVIDER */}
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="px-3 text-sm text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* FOOTER */}
            <p className="text-sm text-center text-gray-600">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}