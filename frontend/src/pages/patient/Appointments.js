import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PatientNav from '../../components/PatientNav';
import api from '../../api';

function Appointments() {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    useEffect(() => {
        filterAppointments();
    }, [statusFilter, appointments]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/patient/appointments');
            if (res.data.success) {
                setAppointments(res.data.appointments);
                setFilteredAppointments(res.data.appointments);
            }
        } catch (err) {
            console.error('Failed to fetch appointments:', err);
            setMessage('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };

    const filterAppointments = () => {
        if (statusFilter) {
            setFilteredAppointments(appointments.filter(apt => apt.status === statusFilter));
        } else {
            setFilteredAppointments(appointments);
        }
    };

    const handleCancelAppointment = async (appointmentId) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }

        try {
            const res = await api.delete(`/patient/appointments/${appointmentId}`);
            if (res.data.success) {
                setMessage('Appointment cancelled successfully');
                fetchAppointments(); // Refresh list
            } else {
                setMessage(res.data.message || 'Failed to cancel appointment');
            }
        } catch (err) {
            console.error('Failed to cancel appointment:', err);
            setMessage('Failed to cancel appointment');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'confirmed':
                return 'status-confirmed';
            case 'pending':
                return 'status-pending';
            case 'cancelled':
                return 'status-cancelled';
            case 'completed':
                return 'status-completed';
            default:
                return '';
        }
    };

    return (
        <div className="appointments-page">
            <PatientNav />

            <div className="appointments-container">
                <div className="appointments-header">
                    <h1>My Appointments</h1>
                    <Link to="/patient/doctors" className="btn-new-appointment">
                        + Book New Appointment
                    </Link>
                </div>

                {message && (
                    <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                {/* Filter */}
                <div className="filter-section">
                    <label>Filter by Status:</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Appointments</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>

                {loading ? (
                    <div className="loading">Loading appointments...</div>
                ) : filteredAppointments.length === 0 ? (
                    <div className="no-appointments">
                        <p>No appointments found.</p>
                        <Link to="/patient/doctors" className="btn-book-first">
                            Book Your First Appointment
                        </Link>
                    </div>
                ) : (
                    <div className="appointments-list">
                        {filteredAppointments.map(apt => (
                            <div key={apt.appointment_id} className="appointment-card">
                                <div className="appointment-header">
                                    <h3>Dr. {apt.doctor_name}</h3>
                                    <span className={`status-badge ${getStatusClass(apt.status)}`}>
                                        {apt.status}
                                    </span>
                                </div>

                                <div className="appointment-details">
                                    <p><strong>Specialization:</strong> {apt.specialization}</p>
                                    <p><strong>Date & Time:</strong> {formatDate(apt.date_time)}</p>
                                    <p><strong>Consultation Fee:</strong> ৳{apt.consultation_fee || 0}</p>
                                    <p><strong>Appointment ID:</strong> #{apt.appointment_id}</p>
                                </div>

                                <div className="appointment-actions">
                                    {apt.status === 'Pending' && (
                                        <Link
                                            to={`/patient/payment/${apt.appointment_id}`}
                                            className="btn-pay"
                                        >
                                            Pay Now
                                        </Link>
                                    )}

                                    {(apt.status === 'Pending' || apt.status === 'Confirmed') && (
                                        <button
                                            onClick={() => handleCancelAppointment(apt.appointment_id)}
                                            className="btn-cancel-apt"
                                        >
                                            Cancel
                                        </button>
                                    )}

                                    {apt.status === 'Confirmed' && (
                                        <Link
                                            to={`/patient/consultation/${apt.doctor_id}`}
                                            className="btn-pay"
                                            style={{ backgroundColor: '#2563eb', marginLeft: '10px' }}
                                        >
                                            Chat
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Appointments;
