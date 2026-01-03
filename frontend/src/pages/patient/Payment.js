import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PatientNav from '../../components/PatientNav';
import api from '../../api';

function Payment() {
    const { appointmentId } = useParams();
    const navigate = useNavigate();
    const [appointment, setAppointment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchAppointmentDetails();
    }, [appointmentId]);

    const fetchAppointmentDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get('/patient/appointments');
            if (res.data.success) {
                const apt = res.data.appointments.find(
                    a => a.appointment_id === parseInt(appointmentId)
                );

                if (apt) {
                    setAppointment(apt);
                } else {
                    setMessage('Appointment not found');
                }
            }
        } catch (err) {
            console.error('Failed to fetch appointment:', err);
            setMessage('Failed to load appointment details');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        setProcessing(true);
        setMessage('');

        try {
            const res = await api.post('/patient/payments/initiate', {
                appointment_id: appointmentId,
            });

            if (res.data.success) {
                // Redirect to SSLCommerz payment gateway
                window.location.href = res.data.gatewayUrl;
            } else {
                setMessage(res.data.message || 'Failed to initiate payment');
                setProcessing(false);
            }
        } catch (err) {
            console.error('Payment initiation failed:', err);
            setMessage('Failed to initiate payment. Please try again.');
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="payment-page">
                <PatientNav />
                <div className="payment-container">
                    <div className="loading">Loading payment details...</div>
                </div>
            </div>
        );
    }

    if (!appointment) {
        return (
            <div className="payment-page">
                <PatientNav />
                <div className="payment-container">
                    <div className="error-message">{message || 'Appointment not found'}</div>
                    <button onClick={() => navigate('/patient/appointments')} className="btn-back">
                        Back to Appointments
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="payment-page">
            <PatientNav />

            <div className="payment-container">
                <h1>Payment</h1>

                {message && (
                    <div className="message error">{message}</div>
                )}

                {/* Appointment Summary */}
                <div className="payment-summary">
                    <h2>Appointment Details</h2>

                    <div className="summary-row">
                        <span>Doctor:</span>
                        <strong>Dr. {appointment.doctor_name}</strong>
                    </div>

                    <div className="summary-row">
                        <span>Specialization:</span>
                        <strong>{appointment.specialization}</strong>
                    </div>

                    <div className="summary-row">
                        <span>Date & Time:</span>
                        <strong>
                            {new Date(appointment.date_time).toLocaleString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </strong>
                    </div>

                    <div className="summary-row">
                        <span>Appointment ID:</span>
                        <strong>#{appointment.appointment_id}</strong>
                    </div>

                    <div className="summary-row total">
                        <span>Consultation Fee:</span>
                        <strong>৳{appointment.consultation_fee || 0}</strong>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="payment-method">
                    <h2>Payment Method</h2>
                    <div className="method-card">
                        <img
                            src="https://sslcommerz.com/wp-content/uploads/2019/11/logo_website.png"
                            alt="SSLCommerz"
                            className="payment-logo"
                        />
                        <p>Secure payment powered by SSLCommerz</p>
                        <p className="payment-options">
                            Supports: Credit Card, Debit Card, Mobile Banking, Internet Banking
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="payment-actions">
                    <button
                        onClick={handlePayment}
                        className="btn-pay-now"
                        disabled={processing || appointment.status === 'Confirmed'}
                    >
                        {processing ? 'Processing...' :
                            appointment.status === 'Confirmed' ? 'Already Paid' :
                                'Proceed to Payment'}
                    </button>

                    <button
                        onClick={() => navigate('/patient/appointments')}
                        className="btn-cancel"
                        disabled={processing}
                    >
                        Cancel
                    </button>
                </div>

                <div className="payment-note">
                    <p><strong>Note:</strong> You will be redirected to SSLCommerz secure payment gateway. Your appointment will be confirmed after successful payment.</p>
                </div>
            </div>
        </div>
    );
}

export default Payment;
