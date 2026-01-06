import { useState } from "react";

function WaterIntake() {
  const [weight, setWeight] = useState("");
  const [water, setWater] = useState(null);

  const calculate = () => {
    if (weight) setWater((weight * 0.033).toFixed(2));
  };

  return (
    <div className="hc-box">
      <h2>Daily Water Intake</h2>

      <input placeholder="Weight (kg)" type="number" onChange={e => setWeight(e.target.value)} />
      <button onClick={calculate}>Calculate</button>

      {water && <p className="hc-result">{water} Liters / Day</p>}
    </div>
  );
}

export default WaterIntake;
