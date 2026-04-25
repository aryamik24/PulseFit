import { useState } from "react";
import { useChat } from "../context/ChatContext";

/* ---------- WORKOUT DETAILS ---------- */
const workoutDetails = {
  Push: ["Bench Press", "Shoulder Press", "Tricep Dips", "Lateral Raises"],
  Pull: ["Pull-ups", "Rows", "Face Pull", "Bicep Curls"],
  Legs: ["Squats", "Lunges", "Leg Press", "Calf Raises"],
  Rest: ["Recovery", "Stretching", "Walking"],
};

export default function Home() {
  const { meals, workoutConfig, setWorkoutConfig } = useChat();
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  // 🔥 LOCAL STATE (NOT AUTO-SAVE)
  const [localStartDate, setLocalStartDate] = useState(workoutConfig.startDate);
  const [localSplit, setLocalSplit] = useState(workoutConfig.split.join(", "));

  const { startDate, split } = workoutConfig;

  /* ---------- GET WORKOUT ---------- */
  const getWorkout = (offset = 0) => {
    const start = new Date(startDate);
    const today = new Date();

    const diff =
      Math.floor((today - start) / (1000 * 60 * 60 * 24)) + offset;

    return split[((diff % split.length) + split.length) % split.length];
  };

  /* ---------- TOTALS ---------- */
  const totals = meals.reduce(
    (acc, m) => {
      acc.calories += m.calories * m.qty;
      acc.protein += m.protein * m.qty;
      acc.carbs += m.carbs * m.qty;
      acc.fat += m.fat * m.qty;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const calorieGoal = 2200;

  /* ---------- SAVE SETTINGS ---------- */
  const handleSave = () => {
    const newSplit = localSplit.split(",").map((s) => s.trim()).filter(Boolean);

    if (newSplit.length === 0) return;

    setWorkoutConfig({
      startDate: localStartDate,
      split: newSplit,
    });
  };

  return (
    <div className="section space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-gray-500">Personalized fitness overview</p>
      </div>

      {/* CALORIES */}
      <div className="card">
        <div className="flex justify-between">
          <p className="card-title">Calories</p>
          <p className="text-sm text-gray-500">
            {totals.calories} / {calorieGoal}
          </p>
        </div>

        <div className="w-full bg-gray-100 h-3 rounded-full mt-3">
          <div
            className="h-full bg-black transition-all"
            style={{
              width: `${Math.min(
                100,
                (totals.calories / calorieGoal) * 100
              )}%`,
            }}
          />
        </div>
      </div>

      {/* MACROS */}
      <div className="grid md:grid-cols-4 gap-4">
        <Stat label="Protein" value={`${totals.protein}g`} />
        <Stat label="Carbs" value={`${totals.carbs}g`} />
        <Stat label="Fat" value={`${totals.fat}g`} />
        <Stat
          label="Remaining"
          value={`${Math.max(0, calorieGoal - totals.calories)} kcal`}
        />
      </div>

      {/* TODAY WORKOUT */}
      <div className="card">
        <p className="card-title">Today’s Workout</p>
        <p className="text-lg font-semibold mt-1">
          {getWorkout()}
        </p>

        <button
          onClick={() => setSelectedWorkout(getWorkout())}
          className="btn mt-3"
        >
          View Workout
        </button>
      </div>

      {/* WORKOUT CALENDAR */}
      <div className="card">
        <p className="card-title mb-3">Workout Calendar</p>

        <div className="grid grid-cols-7 gap-2 text-center text-sm">
          {[...Array(14)].map((_, i) => {
            const workout = getWorkout(i);

            return (
              <div
                key={i}
                onClick={() => setSelectedWorkout(workout)}
                className={`p-3 rounded-xl cursor-pointer transition ${
                  i === 0
                    ? "bg-black text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <p className="text-xs">{`Day ${i + 1}`}</p>
                <p className="font-medium">{workout}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* WORKOUT SETTINGS */}
      <div className="card">
        <p className="card-title">Workout Settings</p>

        <input
          type="date"
          value={localStartDate}
          onChange={(e) => setLocalStartDate(e.target.value)}
          className="input mt-2"
        />

        <input
          type="text"
          value={localSplit}
          onChange={(e) => setLocalSplit(e.target.value)}
          placeholder="Push, Pull, Legs, Rest"
          className="input mt-2"
        />

        <button onClick={handleSave} className="btn mt-3">
          Save Settings
        </button>
      </div>

      {/* MODAL */}
      {selectedWorkout && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[320px]">
            <h2 className="text-xl font-semibold mb-3">
              {selectedWorkout} Workout
            </h2>

            <ul className="text-sm text-gray-600 space-y-1">
              {workoutDetails[selectedWorkout]?.map((ex, i) => (
                <li key={i}>• {ex}</li>
              ))}
            </ul>

            <button
              onClick={() => setSelectedWorkout(null)}
              className="btn mt-4 w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

/* ---------- COMPONENT ---------- */
function Stat({ label, value }) {
  return (
    <div className="card">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}