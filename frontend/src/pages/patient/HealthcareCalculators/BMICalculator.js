import { useState } from "react";

function BMICalculator() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(null);

  const calculateBMI = () => {
    const h = height / 100;
    if (h && weight) {
      setBmi((weight / (h * h)).toFixed(2));
    }
  };

  return (
    <div className="hc-box">
      <h2>BMI Calculator</h2>

      <input placeholder="Height (cm)" type="number" onChange={e => setHeight(e.target.value)} />
      <input placeholder="Weight (kg)" type="number" onChange={e => setWeight(e.target.value)} />

      <button onClick={calculateBMI}>Calculate</button>

      {bmi && <p className="hc-result">Your BMI: {bmi}</p>}
    </div>
  );
}

export default BMICalculator;
