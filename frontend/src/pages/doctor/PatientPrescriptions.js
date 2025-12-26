import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../../AuthContext';

function PatientPrescriptions() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);

  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'Patient') {
      navigate('/login');
      return;
    }
    const load = async () => {
      try {
        const res = await api.get('/patient/prescriptions');
        if (res.data.success) setPrescriptions(res.data.prescriptions || []);
      } catch (err) {
        alert('Failed to load prescriptions');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authLoading, navigate, user]);

  if (authLoading || loading) return <main className="page"><p>Loading...</p></main>;

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Patient</p>
          <h2>My Prescriptions</h2>
          <p className="muted">View prescriptions from your doctors.</p>
        </div>
      </div>

      <div className="grid-list">
        {prescriptions.length === 0 && <p className="muted">No prescriptions available.</p>}
        {prescriptions.map((p) => (
          <section key={p.prescription_id} className="card">
            <div className="card-title">Prescription #{p.prescription_id}</div>
            <div className="muted small">Doctor: {p.doctor_name || 'Doctor'} · {new Date(p.date_time).toLocaleString()}</div>
            <div className="muted small">Appointment: {p.appointment_time ? new Date(p.appointment_time).toLocaleString() : p.appointment_id}</div>
            <div className="pill medicines">
              {p.medicine_list && p.medicine_list.length > 0 ? p.medicine_list.map((m, idx) => (
                <div key={idx} className="medicine-row">
                  <strong>{m.name}</strong>
                  <div className="muted small">
                    {[m.dosage, m.frequency, m.duration].filter(Boolean).join(' · ')}
                  </div>
                  {m.instructions && <div className="muted small">Note: {m.instructions}</div>}
                </div>
              )) : <div className="muted small">No medicines listed.</div>}
            </div>
            {p.notes && <p>{p.notes}</p>}
          </section>
        ))}
      </div>
    </main>
  );
}

export default PatientPrescriptions;
