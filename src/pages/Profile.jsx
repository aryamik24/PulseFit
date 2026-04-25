import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    age: "",
    height: "",
    weight: "",
    goal: "fat_loss",
    diet_type: "veg",
  });

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        navigate("/login");
      } else {
        setUser(data.user);
      }
    };

    loadUser();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.age || !form.height || !form.weight) {
      alert("Fill all fields");
      return;
    }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      name: form.name,
      age: Number(form.age),
      height: Number(form.height),
      weight: Number(form.weight),
      goal: form.goal,
      diet_type: form.diet_type,
    });

    if (error) {
      alert(error.message);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-md w-96">
        <h1 className="text-xl font-bold mb-4">Complete Your Profile</h1>

        <input
          name="name"
          placeholder="Name"
          className="w-full mb-2 p-2 border rounded-lg"
          onChange={handleChange}
        />

        <input
          name="age"
          placeholder="Age"
          className="w-full mb-2 p-2 border rounded-lg"
          onChange={handleChange}
        />

        <input
          name="height"
          placeholder="Height (cm)"
          className="w-full mb-2 p-2 border rounded-lg"
          onChange={handleChange}
        />

        <input
          name="weight"
          placeholder="Weight (kg)"
          className="w-full mb-2 p-2 border rounded-lg"
          onChange={handleChange}
        />

        <select
          name="goal"
          className="w-full mb-2 p-2 border rounded-lg"
          onChange={handleChange}
        >
          <option value="fat_loss">Fat Loss</option>
          <option value="muscle_gain">Muscle Gain</option>
          <option value="maintenance">Maintenance</option>
        </select>

        <select
          name="diet_type"
          className="w-full mb-3 p-2 border rounded-lg"
          onChange={handleChange}
        >
          <option value="veg">Veg</option>
          <option value="eggetarian">Eggetarian</option>
          <option value="nonveg">Non-Veg</option>
        </select>

        <button
          onClick={handleSubmit}
          className="w-full bg-black text-white p-2 rounded-lg"
        >
          Save Profile
        </button>
      </div>
    </div>
  );
}