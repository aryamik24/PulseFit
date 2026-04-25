import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* ---------- COLLAPSIBLE ---------- */
function Card({ title, children }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="card">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <h2 className="card-title">{title}</h2>
        <span className="text-gray-400">{open ? "−" : "+"}</span>
      </div>

      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default function Progress() {
  const [logs, setLogs] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [bmiData, setBmiData] = useState([]);
  const [fatData, setFatData] = useState([]);

  const [weight, setWeight] = useState("");
  const [date, setDate] = useState("");

  const [height, setHeight] = useState("170");
  const [savingHeight, setSavingHeight] = useState(false);

  const [manualWeight, setManualWeight] = useState("");
  const [manualHeight, setManualHeight] = useState("");

  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (logs.length) generateDerivedData(logs, height);
  }, [height]);

  const loadAllData = async () => {
    const { data: user } = await supabase.auth.getUser();

    const { data: profile } = await supabase
      .from("profiles")
      .select("height")
      .eq("id", user.user.id)
      .single();

    const currentHeight = profile?.height || height;
    setHeight(currentHeight);

    const { data } = await supabase
      .from("progress")
      .select("*")
      .eq("user_id", user.user.id)
      .order("created_at", { ascending: true });

    const logsData = data || [];
    setLogs(logsData);

    generateDerivedData(logsData, currentHeight);
  };

  const generateDerivedData = (logsData, hValue) => {
    const h = hValue / 100;

    setChartData(
      logsData.map((l) => ({
        date: new Date(l.created_at).toLocaleDateString(),
        weight: l.weight,
      }))
    );

    setBmiData(
      logsData.map((l) => ({
        date: new Date(l.created_at).toLocaleDateString(),
        bmi: (l.weight / (h * h)).toFixed(1),
      }))
    );

    setFatData(
      logsData.map((l) => {
        const bmi = l.weight / (h * h);
        return {
          date: new Date(l.created_at).toLocaleDateString(),
          fat: (1.2 * bmi + 0.23 * 25 - 16.2).toFixed(1),
        };
      })
    );
  };

  const saveHeight = async () => {
    setSavingHeight(true);
    const { data: user } = await supabase.auth.getUser();

    await supabase.from("profiles").upsert({
      id: user.user.id,
      height: Number(height),
    });

    setSavingHeight(false);
  };

  const saveWeight = async () => {
    if (!weight) return;

    const { data: user } = await supabase.auth.getUser();

    if (editingId) {
      await supabase
        .from("progress")
        .update({
          weight: Number(weight),
          created_at: date || new Date(),
        })
        .eq("id", editingId);

      setEditingId(null);
    } else {
      await supabase.from("progress").insert({
        user_id: user.user.id,
        weight: Number(weight),
        created_at: date || new Date(),
      });
    }

    setWeight("");
    setDate("");
    loadAllData();
  };

  const handleEdit = (log) => {
    setWeight(log.weight);
    setDate(log.created_at.split("T")[0]);
    setEditingId(log.id);
  };

  const handleDelete = async (id) => {
    await supabase.from("progress").delete().eq("id", id);
    loadAllData();
  };

  const calcBMI =
    manualWeight && manualHeight
      ? (
          manualWeight /
          ((manualHeight / 100) * (manualHeight / 100))
        ).toFixed(1)
      : null;

  const calcFat =
    calcBMI ? (1.2 * calcBMI + 0.23 * 25 - 16.2).toFixed(1) : null;

  const saveFromCalculator = async () => {
    const { data: user } = await supabase.auth.getUser();

    await supabase.from("progress").insert({
      user_id: user.user.id,
      weight: Number(manualWeight),
      created_at: new Date(),
    });

    setManualWeight("");
    setManualHeight("");
    loadAllData();
  };

  return (
    <div className="section">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Progress</h1>
        <p className="text-sm text-gray-500">
          Track your body metrics and trends
        </p>
      </div>

      {/* GRAPHS */}
      <div className="grid md:grid-cols-3 gap-5">
        {[
          { title: "Weight", data: chartData, key: "weight" },
          { title: "BMI", data: bmiData, key: "bmi" },
          { title: "Body Fat %", data: fatData, key: "fat" },
        ].map((g) => (
          <div key={g.title} className="card">
            <p className="text-sm text-gray-500 mb-2">{g.title}</p>

            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={g.data}>
                <CartesianGrid strokeDasharray="2 2" opacity={0.05} />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey={g.key}
                  stroke="#111"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* LOG WEIGHT */}
      <div className="card">
        <h2 className="card-title">Log Weight</h2>
        <div className="flex gap-3">
          <input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="input"
            placeholder="Weight (kg)"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input"
          />
          <button onClick={saveWeight} className="btn">
            {editingId ? "Update" : "Add"}
          </button>
        </div>
      </div>

      {/* HEIGHT */}
      <div className="card">
        <h2 className="card-title">Height</h2>
        <div className="flex gap-3">
          <input
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="input"
            placeholder="Height (cm)"
          />
          <button onClick={saveHeight} className="btn">
            {savingHeight ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* BMI (NOT FOLDABLE) */}
      <div className="card">
        <h2 className="card-title">BMI</h2>

        <p className="text-xs text-gray-500 mb-3">
          BMI = weight (kg) / height² (m²)
        </p>

        <div className="flex gap-3">
          <input
            placeholder="Weight (kg)"
            className="input"
            value={manualWeight}
            onChange={(e) => setManualWeight(e.target.value)}
          />
          <input
            placeholder="Height (cm)"
            className="input"
            value={manualHeight}
            onChange={(e) => setManualHeight(e.target.value)}
          />
        </div>

        {(calcBMI || calcFat) && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            {calcBMI && <p>BMI: <strong>{calcBMI}</strong></p>}
            {calcFat && <p>Body Fat: <strong>{calcFat}%</strong></p>}
          </div>
        )}

        {manualWeight && (
          <button onClick={saveFromCalculator} className="btn mt-4 w-full">
            Save as Entry
          </button>
        )}
      </div>

      {/* HISTORY */}
      <Card title="Weight History">
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {logs.map((log) => (
            <div key={log.id} className="flex justify-between bg-gray-50 p-3 rounded-xl">
              <div>
                <p>{log.weight} kg</p>
                <p className="text-xs text-gray-500">
                  {new Date(log.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-3 text-sm">
                <button onClick={() => handleEdit(log)}>Edit</button>
                <button onClick={() => handleDelete(log.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
}