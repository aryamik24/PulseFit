export function getWorkoutPlan(goal) {
  if (goal === "fat_loss") {
    return [
      { day: "Day 1", workout: "Full Body + Cardio" },
      { day: "Day 2", workout: "Rest / Walk" },
      { day: "Day 3", workout: "Upper Body" },
      { day: "Day 4", workout: "Cardio + Core" },
      { day: "Day 5", workout: "Lower Body" },
      { day: "Day 6", workout: "Light Activity" },
      { day: "Day 7", workout: "Rest" },
    ];
  }

  if (goal === "muscle_gain") {
    return [
      { day: "Day 1", workout: "Chest + Triceps" },
      { day: "Day 2", workout: "Back + Biceps" },
      { day: "Day 3", workout: "Rest" },
      { day: "Day 4", workout: "Legs" },
      { day: "Day 5", workout: "Shoulders" },
      { day: "Day 6", workout: "Light Cardio" },
      { day: "Day 7", workout: "Rest" },
    ];
  }

  return [
    { day: "Day 1", workout: "Full Body" },
    { day: "Day 2", workout: "Rest" },
    { day: "Day 3", workout: "Full Body" },
    { day: "Day 4", workout: "Rest" },
    { day: "Day 5", workout: "Full Body" },
    { day: "Day 6", workout: "Walk / Sports" },
    { day: "Day 7", workout: "Rest" },
  ];
}