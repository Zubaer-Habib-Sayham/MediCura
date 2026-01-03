import React from 'react';
import { Link } from 'react-router-dom';
import PatientNav from '../../components/PatientNav';

function PaymentFailed() {
    return (
        <div className="payment-result-page">
            <PatientNav />

            <div className="result-container">
                <div className="error-icon">✗</div>
                <h1>Payment Failed</h1>
                <p className="error-message">
                    Unfortunately, your payment could not be processed. Please try again.
                </p>

                <div className="result-actions">
                    <Link to="/patient/appointments" className="btn-primary">
                        Back to Appointments
                    </Link>
                    <Link to="/patient/dashboard" className="btn-secondary">
                        Go to Dashboard
                    </Link>
                </div>

                <div className="help-section">
                    <h3>Need Help?</h3>
                    <p>If you continue to experience issues with payment, please:</p>
                    <ul>
                        <li>Check your card details and try again</li>
                        <li>Ensure you have sufficient balance</li>
                        <li>Try a different payment method</li>
                        <li>Contact our support team for assistance</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default PaymentFailed;
