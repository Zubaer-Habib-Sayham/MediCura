import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';

function HealthCalculators() {
  const navigate = useNavigate();

  return (
    <div className="quick-actions">
      <h2>HealthCare Calculators</h2>

      <div className="actions-grid">
        <Link to="/patient/healthcare-calculators/bmi" className="action-card">
            <span className="action-icon">⚖️</span>
            <h3>BMI Calculator</h3>
            <p>Measure BMI</p>
        </Link>

        <Link to="/patient/healthcare-calculators/water" className="action-card">
            <span className="action-icon">💧</span>
            <h3>Daily Water Intake Calculator</h3>
            <p>Measure your daily minimum Water intake limit based on your Weight</p>
        </Link>

        <Link to="/patient/healthcare-calculators/calorie" className="action-card">
            <span className="action-icon">⚡</span>
            <h3>Daily Calorie Intake Calculator</h3>
            <p>Measure your daily minimum Calorie intake limit based on your Age, Weight and Hieght</p>
        </Link>
      </div>
    </div>
  );
}

export default HealthCalculators;
