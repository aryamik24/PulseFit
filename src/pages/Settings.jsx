import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

/* ---------- OPTIONS ---------- */
const DIET_OPTIONS = [
  "Vegetarian",
  "Eggitarian",
  "Non-Vegetarian",
  "Vegan",
];

const GOAL_OPTIONS = [
  "Fat Loss",
  "Muscle Gain",
  "Maintain",
];

const ALLERGEN_OPTIONS = [
  "Milk",
  "Eggs",
  "Peanuts",
  "Soy",
  "Gluten",
  "Seafood",
];

export default function Settings() {
  const [profile, setProfile] = useState(null);

  const [name, setName] = useState("");
  const [diet, setDiet] = useState("Non-Vegetarian");
  const [goal, setGoal] = useState("Muscle Gain");

  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");

  const [allergens, setAllergens] = useState([]);

  const [password, setPassword] = useState("");
  // const [darkMode, setDarkMode] = useState(false); // 🔥 disabled

  const [loading, setLoading] = useState(false);

  /* ---------- LOAD ---------- */
  useEffect(() => {
    loadProfile();

    // 🔥 Dark mode disabled
    // const theme = localStorage.getItem("theme");
    // if (theme === "dark") {
    //   document.documentElement.classList.add("dark");
    //   setDarkMode(true);
    // }
  }, []);

  const loadProfile = async () => {
    const { data: user } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.user.id)
      .single();

    setProfile(data);

    setName(data?.name || "");
    setDiet(data?.diet_type || "Non-Vegetarian");
    setGoal(data?.goal || "Muscle Gain");

    setAge(data?.age || "");
    setHeight(data?.height || "");

    setAllergens(data?.allergens || []);
  };

  /* ---------- SAVE ---------- */
  const saveProfile = async () => {
    setLoading(true);

    const { data: user } = await supabase.auth.getUser();

    await supabase
      .from("profiles")
      .update({
        name,
        diet_type: diet,
        goal,
        age,
        height,
        allergens,
      })
      .eq("id", user.user.id);

    setLoading(false);
    alert("Profile updated");
  };

  /* ---------- PASSWORD ---------- */
  const updatePassword = async () => {
    if (!password) return;

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) alert("Error updating password");
    else {
      alert("Password updated");
      setPassword("");
    }
  };

  /* ---------- DARK MODE (DISABLED) ---------- */
  // const toggleDark = () => {
  //   // disabled
  // };

  /* ---------- TOGGLE ALLERGEN ---------- */
  const toggleAllergen = (item) => {
    if (allergens.includes(item)) {
      setAllergens(allergens.filter((a) => a !== item));
    } else {
      setAllergens([...allergens, item]);
    }
  };

  return (
    <div className="section max-w-4xl mx-auto space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-gray-500 text-sm">
          Customize your fitness experience
        </p>
      </div>

      {/* PROFILE */}
      <div className="card space-y-6">
        <h2 className="text-lg font-semibold">Profile</h2>

        {/* NAME */}
        <div>
          <label className="text-sm text-gray-500">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input mt-1"
          />
        </div>

        {/* AGE + HEIGHT */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="input mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">Height (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="input mt-1"
            />
          </div>
        </div>

        {/* DIET */}
        <div>
          <label className="text-sm text-gray-500">Diet Preference</label>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            {DIET_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDiet(d)}
                className={`p-3 rounded-xl border text-sm transition
                  ${
                    diet === d
                      ? "border-black bg-black text-white"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* GOAL */}
        <div>
          <label className="text-sm text-gray-500">Goal</label>

          <div className="flex gap-3 mt-2 flex-wrap">
            {GOAL_OPTIONS.map((g) => (
              <button
                key={g}
                onClick={() => setGoal(g)}
                className={`px-4 py-2 rounded-xl text-sm border transition
                  ${
                    goal === g
                      ? "bg-black text-white border-black"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* ALLERGENS */}
        <div>
          <label className="text-sm text-gray-500">Allergens</label>

          <div className="flex flex-wrap gap-2 mt-2">
            {ALLERGEN_OPTIONS.map((a) => (
              <button
                key={a}
                onClick={() => toggleAllergen(a)}
                className={`px-3 py-2 rounded-xl text-sm border transition
                  ${
                    allergens.includes(a)
                      ? "bg-red-500 text-white border-red-500"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <button onClick={saveProfile} className="btn w-full">
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* SECURITY */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Security</h2>

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />

        <button onClick={updatePassword} className="btn w-full">
          Update Password
        </button>
      </div>

      {/* 🔥 DARK MODE SECTION REMOVED */}

    </div>
  );
}