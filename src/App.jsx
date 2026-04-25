import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./services/supabaseClient";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Home from "./pages/Home";
import Progress from "./pages/Progress";
import Coach from "./pages/Coach";
import Analytics from "./pages/AI";
import Meals from "./pages/Meals";
import Settings from "./pages/Settings";

import Layout from "./components/Layout";
import { ChatProvider } from "./context/ChatContext";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  /* 🔥 GLOBAL DARK MODE INIT */
  useEffect(() => {
    const theme = localStorage.getItem("theme");

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  /* 🔐 SUPABASE AUTH CHECK */
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <BrowserRouter>
      <ChatProvider>
        <Routes>

          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* PROTECTED APP */}
          <Route
            element={
              session ? <Layout /> : <Navigate to="/login" replace />
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/meals" element={<Meals />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* DEFAULT */}
          <Route
            path="*"
            element={
              session ? <Navigate to="/" /> : <Navigate to="/login" />
            }
          />

        </Routes>
      </ChatProvider>
    </BrowserRouter>
  );
}