import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../../AuthContext';

function DoctorAppointments() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'Doctor') {
      navigate('/login');
      return;
    }
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.from = `${dateFilter} 00:00:00`;
      const res = await api.get('/doctor/appointments', { params });
      if (res.data.success) {
        setAppointments(res.data.appointments || []);
      }
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Failed to load appointments';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAppointments();
  };

  const updateAppointment = async (id, payload) => {
    try {
      setUpdatingId(id);
      const res = await api.put(`/doctor/appointments/${id}`, payload);
      if (res.data.success && res.data.appointment) {
        setAppointments((prev) =>
          prev.map((a) => (a.appointment_id === id ? res.data.appointment : a))
        );
      } else {
        alert(res.data.message || 'Update failed');
      }
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkCompleted = (id) => updateAppointment(id, { status: 'Completed' });
  const handleCancel = (id) => updateAppointment(id, { status: 'Cancelled' });

  const handleReschedule = (id) => {
    const newDate = prompt('Enter new date (YYYY-MM-DD):');
    if (!newDate) return;
    const newTime = prompt('Enter new time (HH:MM, 24h):');
    if (!newTime) return;
    const date_time = `${newDate} ${newTime}:00`;
    updateAppointment(id, { date_time, status: 'Rescheduled' });
  };

  const formatted = useMemo(() => {
    const fmt = (dt) => new Date(dt);
    const upcoming = appointments
      .filter((a) => a.status !== 'Completed')
      .sort((a, b) => fmt(a.date_time) - fmt(b.date_time));
    const completed = appointments
      .filter((a) => a.status === 'Completed')
      .sort((a, b) => fmt(b.date_time) - fmt(a.date_time));
    return { upcoming, completed };
  }, [appointments]);

  if (authLoading || loading) {
    return (
      <main className="page">
        <p>Loading appointments...</p>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Doctor Dashboard</p>
          <h2>Appointments</h2>
          <p className="muted">Review, reschedule, or complete your appointments.</p>
        </div>
        <div className="cta-row">
          <button className="ghost" onClick={() => navigate('/')}>Back to Home</button>
          <button className="ghost" onClick={handleRefresh}>Refresh</button>
        </div>
      </div>

      <div className="card filters">
        <div className="form-grid">
          <div>
            <label>Status filter</label>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); fetchAppointments(); }}>
              <option value="">All</option>
              <option value="Pending">Pending</option>
              <option value="Rescheduled">Rescheduled</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label>Date (from)</label>
            <input type="date" value={dateFilter} onChange={(e) => { setDateFilter(e.target.value); }} />
          </div>
          <div className="actions">
            <button type="button" className="primary" onClick={fetchAppointments}>Apply Filters</button>
          </div>
        </div>
        {error && <p className="error">{error}</p>}
      </div>

      <section className="card">
        <div className="card-title">Upcoming & Pending</div>
        {formatted.upcoming.length === 0 ? (
          <p className="muted">No pending or rescheduled appointments.</p>
        ) : (
          <div className="table">
            <div className="table-head">
              <div>Patient</div>
              <div>Date</div>
              <div>Time</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            {formatted.upcoming.map((appt) => {
              const dt = new Date(appt.date_time);
              const date = dt.toLocaleDateString();
              const time = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div className="table-row" key={appt.appointment_id}>
                  <div>
                    <strong>{appt.patient_name}</strong>
                    <div className="muted">ID: {appt.patient_id}</div>
                  </div>
                  <div>{date}</div>
                  <div>{time}</div>
                  <div>{appt.status}</div>
                  <div className="row-actions">
                    <button onClick={() => handleReschedule(appt.appointment_id)} disabled={updatingId === appt.appointment_id}>Reschedule</button>
                    <button onClick={() => handleMarkCompleted(appt.appointment_id)} disabled={updatingId === appt.appointment_id}>Mark Done</button>
                    <button className="ghost" onClick={() => handleCancel(appt.appointment_id)} disabled={updatingId === appt.appointment_id}>Cancel</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="card">
        <div className="card-title">History (Completed)</div>
        {formatted.completed.length === 0 ? (
          <p className="muted">No completed appointments yet.</p>
        ) : (
          <div className="table">
            <div className="table-head">
              <div>Patient</div>
              <div>Date</div>
              <div>Time</div>
              <div>Status</div>
            </div>
            {formatted.completed.map((appt) => {
              const dt = new Date(appt.date_time);
              const date = dt.toLocaleDateString();
              const time = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <div className="table-row" key={appt.appointment_id}>
                  <div>
                    <strong>{appt.patient_name}</strong>
                    <div className="muted">ID: {appt.patient_id}</div>
                  </div>
                  <div>{date}</div>
                  <div>{time}</div>
                  <div>{appt.status}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default DoctorAppointments;
