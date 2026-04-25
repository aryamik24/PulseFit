import { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export function ChatProvider({ children }) {
  /* ---------- CHAT (FIX FOR COACH) ---------- */
  const [messages, setMessages] = useState([]);

  /* ---------- MEALS ---------- */
  const [meals, setMeals] = useState([]);

  /* ---------- WORKOUT CONFIG ---------- */
  const [workoutConfig, setWorkoutConfig] = useState({
    startDate: new Date().toISOString().split("T")[0],
    split: ["Push", "Pull", "Legs", "Rest"],
  });

  return (
    <ChatContext.Provider
      value={{
        // 🔥 KEEP THIS FOR COACH
        messages,
        setMessages,

        // 🔥 NEW FEATURES
        meals,
        setMeals,
        workoutConfig,
        setWorkoutConfig,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);