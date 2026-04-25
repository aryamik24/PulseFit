import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";

import { calculateCalories } from "../utils/calorie";
import { getWorkoutPlan } from "../utils/workout";
import { getDietPlan } from "../utils/diet";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [calories, setCalories] = useState(0);
  const [workout, setWorkout] = useState([]);
  const [diet, setDiet] = useState(null);

  const [logs, setLogs] = useState([]);
  const [chartData, setChartData] = useState([]);

  const [weight, setWeight] = useState("");
  const [date, setDate] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return navigate("/login");

    setUser(data.user);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (!profileData) return navigate("/profile");

    setProfile(profileData);

    setCalories(calculateCalories(profileData));
    setWorkout(getWorkoutPlan(profileData.goal));
    setDiet(getDietPlan(profileData.goal, profileData.diet_type));

    await fetchLogs(data.user.id);
    await loadMessages(data.user.id);
  };

  // -------- WEIGHT --------
  const fetchLogs = async (userId) => {
    const { data } = await supabase
      .from("progress")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    const logsData = data || [];
    setLogs(logsData);

    setChartData(
      logsData.map((l) => ({
        date: new Date(l.created_at).toLocaleDateString(),
        weight: l.weight,
      }))
    );
  };

  const saveWeight = async () => {
    if (!weight) return;

    const { data } = await supabase.auth.getUser();

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
        user_id: data.user.id,
        weight: Number(weight),
        created_at: date || new Date(),
      });
    }

    setWeight("");
    setDate("");
    fetchLogs(data.user.id);
  };

  const handleEdit = (log) => {
    setWeight(log.weight);
    setDate(log.created_at.split("T")[0]);
    setEditingId(log.id);
  };

  const handleDelete = async (id) => {
    const { data } = await supabase.auth.getUser();
    await supabase.from("progress").delete().eq("id", id);
    fetchLogs(data.user.id);
  };

  // -------- CHAT --------
  const loadMessages = async (userId) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data.map((m) => ({ role: m.role, content: m.content })));
    }
  };

  const sendMessage = async () => {
    if (!input) return;

    const { data: userData } = await supabase.auth.getUser();

    const userMsg = { role: "user", content: input };
    setMessages((p) => [...p, userMsg]);

    await supabase.from("chat_messages").insert({
      user_id: userData.user.id,
      role: "user",
      content: input,
    });

    setInput("");

    const res = await fetch("http://127.0.0.1:3001/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: input,
        context: {
          goal: profile?.goal,
          calories,
          weight: logs.at(-1)?.weight,
        },
        history: messages.slice(-10),
      }),
    });

    const data = await res.json();

    const botMsg = { role: "assistant", content: data.content };
    setMessages((p) => [...p, botMsg]);

    await supabase.from("chat_messages").insert({
      user_id: userData.user.id,
      role: "assistant",
      content: data.content,
    });
  };

  // -------- UI --------
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">PulseFit</h1>
          <p className="text-gray-500">{user?.email}</p>
        </div>

        {/* TOP CARDS */}
        <div className="grid md:grid-cols-3 gap-4 mb-5">
          <Card title="Calories" value={`${calories} kcal`} />
          <Card title="Goal" value={profile?.goal} />
          <Card
            title="Latest Weight"
            value={`${logs.at(-1)?.weight || "-"} kg`}
          />
        </div>

        {/* GRAPH */}
        <Section title="Weight Progress">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line dataKey="weight" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Section>

        {/* LOG WEIGHT (FIXED UI) */}
        <Section title="Log Weight">
          <div className="flex flex-col md:flex-row gap-3">

            <Input
              label="Weight (kg)"
              value={weight}
              onChange={setWeight}
              placeholder="72.5"
            />

            <Input
              type="date"
              label="Date"
              value={date}
              onChange={setDate}
            />

            <button
              onClick={saveWeight}
              className={`h-[48px] px-6 rounded-xl text-white mt-5 md:mt-6 ${
                editingId
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-black hover:opacity-90"
              }`}
            >
              {editingId ? "Update" : "Add"}
            </button>

          </div>
        </Section>

        {/* HISTORY */}
        <Section title="History">
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex justify-between items-center bg-gray-50 p-3 rounded-xl"
              >
                <div>
                  <p className="font-semibold">{log.weight} kg</p>
                  <p className="text-xs text-gray-500">
                    {new Date(log.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-4 text-sm">
                  <button onClick={() => handleEdit(log)}>Edit</button>
                  <button onClick={() => handleDelete(log.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* WORKOUT + DIET */}
        <div className="grid md:grid-cols-2 gap-4">
          <Section title="Workout">
            {workout.map((w, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>{w.day}</span>
                <span>{w.workout}</span>
              </div>
            ))}
          </Section>

          <Section title="Diet">
            {diet && (
              <div className="text-sm space-y-1">
                <p>🍳 {diet.breakfast}</p>
                <p>🍛 {diet.lunch}</p>
                <p>🥜 {diet.snack}</p>
                <p>🍽 {diet.dinner}</p>
              </div>
            )}
          </Section>
        </div>

      </div>

      {/* CHAT */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 bg-black text-white px-5 py-3 rounded-full"
      >
        💬
      </button>

      {chatOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white p-4 rounded-xl shadow-xl">
          <div className="max-h-48 overflow-y-auto mb-2 text-sm">
            {messages.map((m, i) => (
              <div key={i}>{m.content}</div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="input-premium flex-1"
            />
            <button onClick={sendMessage} className="btn-premium">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function Card({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm mb-5">
      <h2 className="font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="flex-1">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none"
      />
    </div>
  );
}