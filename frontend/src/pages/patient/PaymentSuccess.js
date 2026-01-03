import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PatientNav from '../../components/PatientNav';

function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const appointmentId = searchParams.get('appointment_id');

    useEffect(() => {
        // Optional: You could fetch updated appointment details here
    }, [appointmentId]);

    return (
        <div className="payment-result-page">
            <PatientNav />

            <div className="result-container">
                <div className="success-icon">✓</div>
                <h1>Payment Successful!</h1>
                <p className="success-message">
                    Your payment has been processed successfully. Your appointment has been confirmed.
                </p>

                {appointmentId && (
                    <div className="appointment-info">
                        <p><strong>Appointment ID:</strong> #{appointmentId}</p>
                    </div>
                )}

                <div className="result-actions">
                    <Link to="/patient/appointments" className="btn-primary">
                        View My Appointments
                    </Link>
                    <Link to="/patient/dashboard" className="btn-secondary">
                        Go to Dashboard
                    </Link>
                </div>

                <div className="next-steps">
                    <h3>What's Next?</h3>
                    <ul>
                        <li>You will receive a confirmation email shortly</li>
                        <li>The doctor will be notified of your appointment</li>
                        <li>You can view your appointment details in "My Appointments"</li>
                        <li>Please arrive 10 minutes before your scheduled time</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default PaymentSuccess;
