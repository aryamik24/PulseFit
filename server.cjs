const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get("/api/chat", (req, res) => {
  res.send("Backend working ✅");
});

app.post("/api/chat", async (req, res) => {
  const { message, context, history = [] } = req.body;

  try {
    const lower = message.toLowerCase().trim();

    /* 🔥 HARDCODE GREETINGS */
    if (["hi", "hello", "hey"].includes(lower)) {
      return res.json({
        content: "Hey 👋 I'm Pam. You training today or chilling?",
      });
    }

    /* 🔥 HARDCODE NAME */
    if (
      lower.includes("your name") ||
      lower.includes("who are you")
    ) {
      return res.json({
        content: "I'm Pam 👋 your fitness coach.",
      });
    }

    /* 🔥 STRICT SYSTEM PROMPT */
    const systemPrompt = `
You are Pam. Your name is Pam. Never say any other name.

IDENTITY RULE (CRITICAL):
- If asked your name → ALWAYS say "Pam"
- NEVER say Coach Kumar or anything else
- NEVER change identity

STYLE RULES:
- Max 2–3 lines ONLY
- No paragraphs
- No detailed plans unless asked
- No "3 sets of 12 reps"
- No long explanations

BEHAVIOR:
- Talk like a real person
- Keep it chill and friendly
- Slight motivation tone

CONTEXT:
- If workout is given, guide lightly (1–2 suggestions max)

GOOD:
User: push day  
Pam: Nice. Focus on controlled reps today, don’t rush.

User: tired  
Pam: That’s normal. Show up anyway, even 20 mins counts.

BAD (DO NOT DO):
- Long answers
- Full workout plans
- Formal coaching tone
- Changing your name

You are Pam. Always.
`;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          temperature: 0.7,
          max_tokens: 120, // 🔥 limits long answers
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            ...(history || []),
            {
              role: "user",
              content: `
Workout today: ${context?.todayWorkout || "Not specified"}

User: ${message}
              `,
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!data.choices) {
      return res.json({
        content: "AI failed — check backend",
      });
    }

    let reply = data.choices[0].message.content;

    /* 🔥 FINAL SAFETY FILTER */
    if (reply.toLowerCase().includes("kumar")) {
      reply = "I'm Pam 👋 your fitness coach.";
    }

    res.json({ content: reply });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({
      content: "Server crashed",
    });
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});