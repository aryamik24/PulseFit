export function calculateCalories(profile) {
  const { weight, height, age, goal } = profile;

  // Simple BMR (Mifflin approx)
  let bmr = 10 * weight + 6.25 * height - 5 * age + 5;

  // Assume moderate activity (student lifestyle)
  let tdee = bmr * 1.4;

  // Adjust based on goal
  if (goal === "fat_loss") tdee -= 400;
  if (goal === "muscle_gain") tdee += 300;

  return Math.round(tdee);
}