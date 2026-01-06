import { useState } from "react";

function CalorieIntake() {
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [calories, setCalories] = useState(null);

  const calculate = () => {
    if (age && weight && height) {
      const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      setCalories(Math.round(bmr));
    }
  };

  return (
    <div className="hc-box">
      <h2>Daily Calorie Intake</h2>

      <input placeholder="Age" type="number" onChange={e => setAge(e.target.value)} />
      <input placeholder="Weight (kg)" type="number" onChange={e => setWeight(e.target.value)} />
      <input placeholder="Height (cm)" type="number" onChange={e => setHeight(e.target.value)} />

      <button onClick={calculate}>Calculate</button>

      {calories && <p className="hc-result">{calories} kcal/day</p>}
    </div>
  );
}

export default CalorieIntake;
