export function calculateStreak(logs) {
  if (!logs || logs.length === 0) return 0;

  let streak = 1;

  for (let i = 0; i < logs.length - 1; i++) {
    const current = new Date(logs[i].created_at);
    const next = new Date(logs[i + 1].created_at);

    const diffDays = Math.floor(
      (current - next) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}