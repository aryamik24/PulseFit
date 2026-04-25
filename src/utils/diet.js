export function getDietPlan(goal, dietType) {
  if (dietType === "veg") {
    return {
      breakfast: "Oats + Milk / Poha + Peanuts",
      lunch: "2 Roti + Dal + Sabzi + Rice",
      snack: "Banana + Roasted Chana",
      dinner: "2 Roti + Paneer / Soyabean + Salad",
    };
  }

  if (dietType === "eggetarian") {
    return {
      breakfast: "2-3 Eggs + Bread / Oats",
      lunch: "2 Roti + Dal + Sabzi",
      snack: "Boiled Eggs + Banana",
      dinner: "Rice + Egg Curry / Paneer",
    };
  }

  return {
    breakfast: "Eggs + Bread",
    lunch: "Rice + Chicken + Dal",
    snack: "Banana + Peanuts",
    dinner: "Roti + Chicken / Egg",
  };
}