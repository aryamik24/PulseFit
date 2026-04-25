export function getCoachResponse(message, profile, calories, logs) {
  const msg = message.toLowerCase();

  if (msg.includes("tired")) {
    return "Take a light day. Go for a walk or do stretching.";
  }

  if (msg.includes("cheap protein")) {
    return "Go for eggs, dal, chana, peanut butter, or soy chunks.";
  }

  if (msg.includes("missed workout")) {
    return "No problem. Continue tomorrow. Consistency matters more than perfection.";
  }

  if (msg.includes("diet")) {
    return `Stick close to your ${profile.goal.replace("_", " ")} calories (~${calories} kcal).`;
  }

  if (msg.includes("progress")) {
    if (logs.length < 2) return "Not enough data yet.";
    const diff = logs[0].weight - logs[logs.length - 1].weight;
    return diff < 0
      ? "You're improving. Keep going."
      : "Progress is slow. Stay consistent.";
  }

  return "Stay consistent. Small daily actions lead to big results.";
}