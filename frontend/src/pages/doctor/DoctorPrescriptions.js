import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../../AuthContext';

const emptyMedicine = { name: '', dosage: '', frequency: '', duration: '', instructions: '' };

function DoctorPrescriptions() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [medicineList, setMedicineList] = useState([{ ...emptyMedicine }]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'Doctor') {
      navigate('/');
      return;
    }
    const load = async () => {
      try {
        const res = await api.get('/doctor/appointments');
        if (res.data.success) setAppointments(res.data.appointments);
      } catch (err) {
        alert('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [authLoading, navigate, user]);

  const selectAppointment = async (appt) => {
    setSelectedAppointment(appt);
    setSelectedPrescription(null);
    setMedicineList([{ ...emptyMedicine }]);
    setNotes('');
    if (!appt) return;
    try {
      const res = await api.get('/doctor/prescriptions', { params: { appointment_id: appt.appointment_id } });
      if (res.data.success) setPrescriptions(res.data.prescriptions || []);
    } catch (err) {
      alert('Failed to load prescriptions');
    }
  };

  const selectForEdit = (presc) => {
    setSelectedPrescription(presc);
    setNotes(presc.notes || '');
    setMedicineList((presc.medicine_list && presc.medicine_list.length) ? presc.medicine_list : [{ ...emptyMedicine }]);
  };

  const handleMedicineChange = (idx, field, value) => {
    setMedicineList((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const addMedicineRow = () => setMedicineList((prev) => [...prev, { ...emptyMedicine }]);
  const removeMedicineRow = (idx) => setMedicineList((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) {
      alert('Select an appointment first');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        appointment_id: selectedAppointment.appointment_id,
        patient_id: selectedAppointment.patient_id,
        medicine_list: medicineList,
        notes,
      };
      let res;
      if (selectedPrescription) {
        res = await api.put(`/doctor/prescriptions/${selectedPrescription.prescription_id}`, payload);
      } else {
        res = await api.post('/doctor/prescriptions', payload);
      }

      if (res.data.success) {
        const refresh = await api.get('/doctor/prescriptions', { params: { appointment_id: selectedAppointment.appointment_id } });
        if (refresh.data.success) setPrescriptions(refresh.data.prescriptions || []);
        setSelectedPrescription(null);
        setMedicineList([emptyMedicine]);
        setNotes('');
        alert('Prescription saved');
      } else {
        alert(res.data.message || 'Save failed');
      }
    } catch (err) {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return <main className="page"><p>Loading...</p></main>;

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Doctor</p>
          <h2>Online Prescription Management</h2>
          <p className="muted">Pick an appointment, add medicines, and send prescriptions to patients.</p>
        </div>
        <div className="cta-row">
          <button className="ghost" onClick={() => navigate('/doctor/dashboard')}>MY Profile</button>
          <button className="ghost" onClick={() => navigate('/')}>Home</button>
        </div>
      </div>

      <div className="two-col">
        <section className="card">
          <div className="card-title">Appointments</div>
          <div className="list">
            {appointments.length === 0 && <p className="muted">No appointments found.</p>}
            {appointments.map((appt) => (
              <div
                key={appt.appointment_id}
                className={`list-item ${selectedAppointment?.appointment_id === appt.appointment_id ? 'active' : ''}`}
                onClick={() => selectAppointment(appt)}
              >
                <div>
                  <strong>{appt.patient_name || 'Patient'}</strong>
                  <div className="muted small">{new Date(appt.date_time).toLocaleString()}</div>
                </div>
                <span className="badge">{appt.status || 'Scheduled'}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="card-title">Existing Prescriptions</div>
          {!selectedAppointment && <p className="muted">Select an appointment to view prescriptions.</p>}
          {selectedAppointment && prescriptions.length === 0 && <p className="muted">No prescriptions yet for this appointment.</p>}
          <div className="list">
            {prescriptions.map((p) => (
              <div key={p.prescription_id} className="list-item">
                <div>
                  <strong>Prescription #{p.prescription_id}</strong>
                  <div className="muted small">{new Date(p.date_time).toLocaleString()}</div>
                  <div className="muted small">{p.medicine_list?.length || 0} medicines</div>
                </div>
                <div className="pill-actions">
                  <button className="ghost" type="button" onClick={() => selectForEdit(p)}>Edit</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card">
        <div className="card-title">{selectedPrescription ? 'Edit Prescription' : 'Create Prescription'}</div>
        {!selectedAppointment && <p className="muted">Pick an appointment to start.</p>}
        {selectedAppointment && (
          <form className="form-grid" onSubmit={handleSubmit}>
            <textarea
              placeholder="Notes / Instructions"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
            />

            <div className="medicine-grid">
              {medicineList.map((med, idx) => (
                <div key={idx} className="medicine-card">
                  <div className="form-grid">
                    <input
                      type="text"
                      placeholder="Medicine name"
                      value={med.name}
                      onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 500mg)"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Frequency (e.g. 2x/day)"
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(idx, 'frequency', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g. 7 days)"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Instructions"
                      value={med.instructions}
                      onChange={(e) => handleMedicineChange(idx, 'instructions', e.target.value)}
                    />
                  </div>
                  {medicineList.length > 1 && (
                    <button type="button" className="ghost small" onClick={() => removeMedicineRow(idx)}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="ghost" onClick={addMedicineRow}>+ Add Medicine</button>
            </div>

            <div className="actions">
              <button type="submit" className="primary" disabled={saving}>{saving ? 'Saving...' : 'Save Prescription'}</button>
            </div>
          </form>
        )}
      </section>

      <div className="muted small" style={{ marginTop: '12px' }}>
        Need to see a patient's perspective? <Link to="/patient/prescriptions">Open patient prescriptions</Link>
      </div>
    </main>
  );
}

export default DoctorPrescriptions;
