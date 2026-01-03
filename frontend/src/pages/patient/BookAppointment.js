import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PatientNav from '../../components/PatientNav';
import api from '../../api';

function BookAppointment() {
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        date: '',
        time: '',
    });

    useEffect(() => {
        fetchDoctor();
    }, [doctorId]);

    const fetchDoctor = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/patient/doctors/${doctorId}`);
            if (res.data.success) {
                setDoctor(res.data.doctor);
            } else {
                setMessage('Doctor not found');
            }
        } catch (err) {
            console.error('Failed to fetch doctor:', err);
            setMessage('Failed to load doctor details');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBooking(true);
        setMessage('');

        try {
            // Combine date and time
            const dateTime = `${formData.date} ${formData.time}:00`;

            const res = await api.post('/patient/appointments', {
                doctor_id: doctorId,
                date_time: dateTime,
            });

            if (res.data.success) {
                const appointmentId = res.data.appointment.appointment_id;

                // Redirect to payment page
                navigate(`/patient/payment/${appointmentId}`);
            } else {
                setMessage(res.data.message || 'Failed to book appointment');
            }
        } catch (err) {
            console.error('Failed to book appointment:', err);
            setMessage('Failed to book appointment');
        } finally {
            setBooking(false);
        }
    };

    if (loading) {
        return (
            <div className="book-appointment">
                <PatientNav />
                <div className="booking-container">
                    <div className="loading">Loading doctor details...</div>
                </div>
            </div>
        );
    }

    if (!doctor) {
        return (
            <div className="book-appointment">
                <PatientNav />
                <div className="booking-container">
                    <div className="error-message">{message || 'Doctor not found'}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="book-appointment">
            <PatientNav />

            <div className="booking-container">
                <h1>Book Appointment</h1>

                {/* Doctor Info */}
                <div className="doctor-summary">
                    <h2>Dr. {doctor.username}</h2>
                    <p><strong>Specialization:</strong> {doctor.specialization}</p>
                    <p><strong>Department:</strong> {doctor.department}</p>
                    <p><strong>Consultation Fee:</strong> ৳{doctor.consultation_fee || 0}</p>
                </div>

                {message && (
                    <div className="message error">{message}</div>
                )}

                {/* Booking Form */}
                <form onSubmit={handleSubmit} className="booking-form">
                    <div className="form-group">
                        <label>Select Date *</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            min={new Date().toISOString().split('T')[0]}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Select Time *</label>
                        <input
                            type="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {doctor.available_days && doctor.available_days.length > 0 && (
                        <div className="availability-info">
                            <h3>Doctor's Available Days:</h3>
                            <p>{doctor.available_days.join(', ')}</p>
                        </div>
                    )}

                    {doctor.available_time_slots && doctor.available_time_slots.length > 0 && (
                        <div className="availability-info">
                            <h3>Available Time Slots:</h3>
                            <p>{doctor.available_time_slots.join(', ')}</p>
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="submit" className="btn-submit" disabled={booking}>
                            {booking ? 'Booking...' : 'Proceed to Payment'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/patient/doctors')}
                            className="btn-cancel"
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                <div className="booking-note">
                    <p><strong>Note:</strong> Your appointment will be confirmed after successful payment.</p>
                </div>
            </div>
        </div>
    );
}

export default BookAppointment;
