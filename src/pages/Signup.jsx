import { useState } from "react";
import { signUp } from "../services/authService";
import { supabase } from "../services/supabaseClient";
import { useNavigate, Link } from "react-router-dom";

/* ---------- OPTIONS ---------- */
const ALLERGEN_OPTIONS = [
  "Milk",
  "Eggs",
  "Peanuts",
  "Soy",
  "Gluten",
  "Seafood",
];

export default function Signup() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    dob: "",
    allergens: [],
  });

  const navigate = useNavigate();

  /* ---------- HANDLE CHANGE ---------- */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ---------- TOGGLE ALLERGEN ---------- */
  const toggleAllergen = (item) => {
    const exists = form.allergens.includes(item);

    if (exists) {
      setForm({
        ...form,
        allergens: form.allergens.filter((a) => a !== item),
      });
    } else {
      setForm({
        ...form,
        allergens: [...form.allergens, item],
      });
    }
  };

  /* ---------- SIGNUP ---------- */
  const handleSignup = async () => {
    const { email, password, dob, allergens } = form;

    const { data, error } = await signUp(email, password);

    if (error) {
      alert(error.message);
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      await supabase.from("profiles").upsert({
        id: userId,
        dob,
        allergens, // 🔥 FIXED
      });
    }

    navigate("/login");
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-[#f7f7f8]">

      {/* LEFT */}
      <div className="hidden md:flex flex-col justify-center px-24 bg-black text-white relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />

        <div className="relative z-10 max-w-sm">
          <h1 className="text-5xl font-semibold tracking-tight mb-4">
            Join PulseFit
          </h1>

          <p className="text-gray-400 leading-relaxed">
            Build discipline. Track progress.  
            Stay consistent.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center justify-center px-6">

        <div className="w-full max-w-md">

          {/* CARD */}
          <div className="bg-white border border-gray-200 rounded-2xl p-10 shadow-lg">

            {/* HEADER */}
            <div className="mb-6">
              <h2 className="text-3xl font-semibold tracking-tight">
                Create account
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                Start your fitness journey
              </p>
            </div>

            {/* INPUTS */}
            <div className="space-y-4">

              <input
                name="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10"
                onChange={handleChange}
              />

              <input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10"
                onChange={handleChange}
              />

              <input
                type="date"
                name="dob"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black/10"
                onChange={handleChange}
              />

            </div>

            {/* ALLERGENS */}
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-2">
                Allergens (optional)
              </p>

              <div className="flex flex-wrap gap-2">
                {ALLERGEN_OPTIONS.map((a) => (
                  <button
                    key={a}
                    onClick={() => toggleAllergen(a)}
                    className={`px-3 py-2 rounded-xl text-sm border transition
                      ${
                        form.allergens.includes(a)
                          ? "bg-red-500 text-white border-red-500"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* BUTTON */}
            <button
              onClick={handleSignup}
              className="w-full mt-6 py-3 rounded-xl bg-black text-white font-medium hover:opacity-90 transition"
            >
              Sign up
            </button>

            {/* DIVIDER */}
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="px-3 text-sm text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* FOOTER */}
            <p className="text-sm text-center text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium hover:underline"
              >
                Login
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}