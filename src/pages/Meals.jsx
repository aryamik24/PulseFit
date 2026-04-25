import { useEffect, useState } from "react";
import { useChat } from "../context/ChatContext";

/* ---------- STORAGE ---------- */
const STORAGE_KEY = "meals";

const saveMeals = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const loadMeals = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export default function Meals() {
  const { meals, setMeals } = useChat();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------- LOAD ON START ---------- */
  useEffect(() => {
    const stored = loadMeals();
    if (stored.length) setMeals(stored);
  }, []);

  /* ---------- SEARCH ---------- */
  const searchFood = async () => {
    if (!query) return;

    setLoading(true);

    try {
      const res = await fetch(
        `https://api.edamam.com/api/food-database/v2/parser?ingr=${query}&app_id=${import.meta.env.VITE_EDAMAM_APP_ID}&app_key=${import.meta.env.VITE_EDAMAM_APP_KEY}`
      );

      const data = await res.json();

      const formatted = data.hints.slice(0, 6).map((item) => ({
        name: item.food.label,
        calories: Math.round(item.food.nutrients.ENERC_KCAL || 0),
        protein: Math.round(item.food.nutrients.PROCNT || 0),
        carbs: Math.round(item.food.nutrients.CHOCDF || 0),
        fat: Math.round(item.food.nutrients.FAT || 0),
        qty: 1,
      }));

      setResults(formatted);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  /* ---------- ADD MEAL ---------- */
  const addMeal = (item) => {
    const existingIndex = meals.findIndex(
      (m) => m.name === item.name
    );

    let updated;

    if (existingIndex !== -1) {
      updated = meals.map((m, i) =>
        i === existingIndex
          ? { ...m, qty: m.qty + 1 }
          : m
      );
    } else {
      updated = [...meals, item];
    }

    setMeals(updated);
    saveMeals(updated); // 🔥 SAVE
  };

  /* ---------- REMOVE 1 ---------- */
  const removeOne = (index) => {
    const updated = meals
      .map((m, i) =>
        i === index ? { ...m, qty: m.qty - 1 } : m
      )
      .filter((m) => m.qty > 0);

    setMeals(updated);
    saveMeals(updated);
  };

  /* ---------- DELETE ---------- */
  const deleteMeal = (index) => {
    const updated = meals.filter((_, i) => i !== index);

    setMeals(updated);
    saveMeals(updated);
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

  return (
    <div className="section space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Meals</h1>
        <p className="text-gray-500 text-sm">
          Track your nutrition intake
        </p>
      </div>

      {/* SEARCH */}
      <div className="card">
        <div className="flex gap-3">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!e.target.value) setResults([]);
            }}
            placeholder="Search food..."
            className="input"
          />
          <button onClick={searchFood} className="btn">
            {loading ? "..." : "Search"}
          </button>
        </div>
      </div>

      {/* RESULTS */}
      {results.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {results.map((item, i) => (
            <div key={i} className="card">
              <h3 className="font-medium">{item.name}</h3>

              <p className="text-sm text-gray-500 mt-2">
                {item.calories} kcal
              </p>

              <button
                onClick={() => addMeal(item)}
                className="btn mt-3"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      )}

      {/* TODAY */}
      <div className="card">
        <h2 className="card-title">Today’s Meals</h2>

        {meals.length === 0 && (
          <p className="text-sm text-gray-400">
            No meals added
          </p>
        )}

        <div className="space-y-3 mt-3">
          {meals.map((m, i) => (
            <div
              key={i}
              className="flex justify-between items-center bg-gray-50 p-3 rounded-xl"
            >
              <div>
                <p className="font-medium">
                  {m.name} × {m.qty}
                </p>
                <p className="text-xs text-gray-500">
                  {m.calories * m.qty} kcal
                </p>
              </div>

              <div className="flex gap-3 text-sm">
                <button onClick={() => removeOne(i)}>-</button>
                <button
                  onClick={() => addMeal(m)}
                >
                  +
                </button>
                <button
                  onClick={() => deleteMeal(i)}
                  className="text-red-500"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOTAL */}
      {meals.length > 0 && (
        <div className="card grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <Stat label="Calories" value={totals.calories} />
          <Stat label="Protein" value={`${totals.protein}g`} />
          <Stat label="Carbs" value={`${totals.carbs}g`} />
          <Stat label="Fat" value={`${totals.fat}g`} />
        </div>
      )}

    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}