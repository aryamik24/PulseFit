import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useChat } from "../context/ChatContext"; // 🔥 ADD

/* ---------- UTIL ---------- */
const todayKey = () => new Date().toISOString().split("T")[0];

const saveData = (key, data) => {
  localStorage.setItem(`${key}-${todayKey()}`, JSON.stringify(data));
};

const loadData = (key) => {
  const data = localStorage.getItem(`${key}-${todayKey()}`);
  return data ? JSON.parse(data) : [];
};

const formatToList = (text) => {
  if (!text) return [];
  return text
    .split("\n")
    .map((l) => l.replace(/^\d+\.|\-|\*/g, "").trim())
    .filter((l) => l.length > 0);
};

/* ---------- PREMIUM CARD ---------- */
function AICard({
  title,
  data,
  loading,
  onGenerate,
  onRefresh,
  defaultOpen = true,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="card hover:shadow-md transition-all duration-200">

      <div className="flex justify-between items-start">
        <h2 className="text-lg font-semibold">{title}</h2>

        <div className="flex gap-3 text-sm text-gray-400">
          <button onClick={onRefresh}>↻</button>
          <button onClick={() => setOpen(!open)}>
            {open ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4">

          <button onClick={onGenerate} className="btn mb-4 w-full">
            {loading ? "Generating..." : "Generate"}
          </button>

          {data.length > 0 && (
            <ul className="space-y-2 text-sm">
              {data.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-gray-400">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

        </div>
      )}
    </div>
  );
}

export default function AI() {
  const [profile, setProfile] = useState(null);

  const [meal, setMeal] = useState([]);
  const [workout, setWorkout] = useState([]);
  const [insight, setInsight] = useState([]);
  const [tips, setTips] = useState([]);

  const [loading, setLoading] = useState({
    meal: false,
    workout: false,
    insight: false,
    tips: false,
  });

  // 🔥 GET WORKOUT CONFIG FROM CONTEXT
  const { workoutConfig } = useChat();
  const { startDate, split } = workoutConfig;

  /* ---------- DYNAMIC WORKOUT (SAME AS HOME) ---------- */
  const getWorkoutDay = () => {
    const start = new Date(startDate);
    const today = new Date();

    const diff = Math.floor(
      (today - start) / (1000 * 60 * 60 * 24)
    );

    return split[((diff % split.length) + split.length) % split.length];
  };

  useEffect(() => {
    loadProfile();

    setMeal(loadData("meal"));
    setWorkout(loadData("workout"));
    setInsight(loadData("insight"));
    setTips(loadData("tips"));
  }, []);

  const loadProfile = async () => {
    const { data: user } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.user.id)
      .single();

    setProfile(data);
  };

  /* ---------- AI ---------- */
  const callAI = async (message, context = {}) => {
    const res = await fetch("http://127.0.0.1:3001/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, context }),
    });

    const data = await res.json();
    return formatToList(data.content);
  };

  /* ---------- GENERATORS ---------- */

  const generateMeal = async () => {
    setLoading((p) => ({ ...p, meal: true }));

    const result = await callAI(
      "Give Indian diet plan in bullet points",
      { goal: profile?.goal, diet: profile?.diet_type }
    );

    setMeal(result);
    saveData("meal", result);

    setLoading((p) => ({ ...p, meal: false }));
  };

  const generateWorkout = async () => {
    const day = getWorkoutDay(); // 🔥 NOW SYNCED

    if (day === "Rest") {
      const restMsg = ["Rest day — recovery, stretching, light walking"];
      setWorkout(restMsg);
      saveData("workout", restMsg);
      return;
    }

    setLoading((p) => ({ ...p, workout: true }));

    const result = await callAI(
      `Give 5 ${day} exercises in bullet points`,
      { goal: profile?.goal }
    );

    setWorkout(result);
    saveData("workout", result);

    setLoading((p) => ({ ...p, workout: false }));
  };

  const generateInsight = async () => {
    setLoading((p) => ({ ...p, insight: true }));

    const result = await callAI(
      "Give short actionable fitness insights",
      { goal: profile?.goal }
    );

    setInsight(result);
    saveData("insight", result);

    setLoading((p) => ({ ...p, insight: false }));
  };

  const generateTips = async () => {
    setLoading((p) => ({ ...p, tips: true }));

    const result = await callAI(
      "Give 5 practical fitness tips",
      {}
    );

    setTips(result);
    saveData("tips", result);

    setLoading((p) => ({ ...p, tips: false }));
  };

  return (
    <div className="section">

      <div className="mb-4">
        <h1 className="text-3xl font-semibold">AI Assistant</h1>
        <p className="text-sm text-gray-500">
          Personalized daily fitness guidance
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        <AICard
          title="Meal Plan"
          data={meal}
          loading={loading.meal}
          onGenerate={generateMeal}
          onRefresh={generateMeal}
        />

        {/* 🔥 FIXED TITLE */}
        <AICard
          title={`Workout (${getWorkoutDay()})`}
          data={workout}
          loading={loading.workout}
          onGenerate={generateWorkout}
          onRefresh={generateWorkout}
        />

        <AICard
          title="Daily Insight"
          data={insight}
          loading={loading.insight}
          onGenerate={generateInsight}
          onRefresh={generateInsight}
          defaultOpen={false}
        />

        <AICard
          title="Quick Tips"
          data={tips}
          loading={loading.tips}
          onGenerate={generateTips}
          onRefresh={generateTips}
          defaultOpen={false}
        />

      </div>

    </div>
  );
}