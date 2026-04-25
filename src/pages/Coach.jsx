import { useState, useEffect, useRef } from "react";
import { useChat } from "../context/ChatContext";

export default function Coach() {
  const { messages, setMessages, workoutConfig } = useChat();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  const { startDate, split } = workoutConfig;

  /* ---------- WORKOUT SYNC ---------- */
  const getWorkout = () => {
    const start = new Date(startDate);
    const today = new Date();

    const diff = Math.floor(
      (today - start) / (1000 * 60 * 60 * 24)
    );

    return split[((diff % split.length) + split.length) % split.length];
  };

  const todayWorkout = getWorkout();

  /* ---------- AUTO SCROLL ---------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* ---------- SEND ---------- */
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [
      ...messages,
      { role: "user", content: input },
    ];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: newMessages,
          context: { todayWorkout },
        }),
      });

      const data = await res.json();

      setMessages([
        ...newMessages,
        { role: "assistant", content: data.content },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Error occurred." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col items-center px-6 py-10">

      {/* HEADER */}
      <div className="w-full max-w-4xl mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          AI Coach: Pam
        </h1>
        <p className="text-gray-500 mt-1">
          Ask anything about your {todayWorkout.toLowerCase()} day
        </p>
      </div>

      {/* CHAT CONTAINER */}
      <div className="w-full max-w-4xl flex flex-col flex-1 bg-white border rounded-2xl shadow-sm">

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-20">
              Ask something like:
              <div className="mt-2 text-sm italic">
                “What should I eat after my workout?”
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`
                  max-w-[70%] px-5 py-3 rounded-2xl text-sm leading-relaxed
                  ${
                    msg.role === "user"
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-800"
                  }
                `}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-gray-400 text-sm">
              Thinking...
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="border-t px-6 py-4 flex gap-3 bg-white rounded-b-2xl">

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI coach..."
            className="input-premium flex-1"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button onClick={sendMessage} className="btn-premium">
            Send
          </button>

        </div>
      </div>
    </div>
  );
}