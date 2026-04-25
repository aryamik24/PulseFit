export function getInsights(logs, calories, goal) {
  if (!logs || logs.length < 2) {
    return "Not enough data yet. Start logging daily.";
  }

  const latest = logs[0].weight;
  const previous = logs[logs.length - 1].weight;

  const diff = latest - previous;

  if (goal === "fat_loss") {
    if (diff < 0) return "Good progress — you're losing weight.";
    if (diff > 0) return "Weight increasing. Try reducing calories slightly.";
  }

  if (goal === "muscle_gain") {
    if (diff > 0) return "Good — you're gaining weight.";
    if (diff < 0) return "Not gaining. Increase calories or protein.";
  }

  return "Maintain consistency. Small changes matter.";
}