import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import PatientNav from '../../components/PatientNav';
import api from '../../api';

function PatientDashboard() {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        upcomingAppointments: 0,
        totalAppointments: 0,
        prescriptions: 0,
    });
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch appointments
            const appointmentsRes = await api.get('/patient/appointments');
            if (appointmentsRes.data.success) {
                const appointments = appointmentsRes.data.appointments;
                const upcoming = appointments.filter(
                    apt => apt.status === 'Confirmed' || apt.status === 'Pending'
                );

                setStats(prev => ({
                    ...prev,
                    totalAppointments: appointments.length,
                    upcomingAppointments: upcoming.length,
                }));

                setUpcomingAppointments(upcoming.slice(0, 5));
            }

            // Fetch prescriptions count
            const prescriptionsRes = await api.get('/patient/prescriptions');
            if (prescriptionsRes.data.success) {
                setStats(prev => ({
                    ...prev,
                    prescriptions: prescriptionsRes.data.prescriptions.length,
                }));
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
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

    return (
        <div className="patient-dashboard">
            <PatientNav />

            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h1>Welcome back, {user?.username}!</h1>
                    <p>Manage your health appointments and medical records</p>
                </div>

                {loading ? (
                    <div className="loading">Loading dashboard...</div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">📅</div>
                                <div className="stat-content">
                                    <h3>{stats.upcomingAppointments}</h3>
                                    <p>Upcoming Appointments</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">🏥</div>
                                <div className="stat-content">
                                    <h3>{stats.totalAppointments}</h3>
                                    <p>Total Appointments</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">💊</div>
                                <div className="stat-content">
                                    <h3>{stats.prescriptions}</h3>
                                    <p>Prescriptions</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="quick-actions">
                            <h2>Quick Actions</h2>
                            <div className="actions-grid">
                                <Link to="/patient/doctors" className="action-card">
                                    <span className="action-icon">🔍</span>
                                    <h3>Find Doctors</h3>
                                    <p>Browse and book appointments</p>
                                </Link>

                                <Link to="/patient/appointments" className="action-card">
                                    <span className="action-icon">📋</span>
                                    <h3>My Appointments</h3>
                                    <p>View and manage appointments</p>
                                </Link>

                                <Link to="/patient/prescriptions" className="action-card">
                                    <span className="action-icon">📄</span>
                                    <h3>Prescriptions</h3>
                                    <p>View your prescriptions</p>
                                </Link>

                                <Link to="/patient/pharmacy" className="action-card">
                                    <span className="action-icon">💊</span>
                                    <h3>Pharmacy</h3>
                                    <p>Order medicines online</p>
                                </Link>
                            </div>
                        </div>

                        {/* Upcoming Appointments */}
                        {upcomingAppointments.length > 0 && (
                            <div className="upcoming-section">
                                <h2>Upcoming Appointments</h2>
                                <div className="appointments-list">
                                    {upcomingAppointments.map(apt => (
                                        <div key={apt.appointment_id} className="appointment-item">
                                            <div className="appointment-info">
                                                <h4>Dr. {apt.doctor_name}</h4>
                                                <p className="specialization">{apt.specialization}</p>
                                                <p className="datetime">{formatDate(apt.date_time)}</p>
                                            </div>
                                            <div className="appointment-status">
                                                <span className={`status-badge ${apt.status.toLowerCase()}`}>
                                                    {apt.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Link to="/patient/appointments" className="view-all-link">
                                    View All Appointments →
                                </Link>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default PatientDashboard;
