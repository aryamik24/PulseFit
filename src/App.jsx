import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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

  /* 🔥 GLOBAL DARK MODE INIT */
  useEffect(() => {
    const theme = localStorage.getItem("theme");

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return (
    <BrowserRouter>
      <ChatProvider>
        <Routes>

          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* APP */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/coach" element={<Coach />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/meals" element={<Meals />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </ChatProvider>
    </BrowserRouter>
  );
}