import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../../AuthContext';

function DoctorConsultations() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'Doctor') {
      navigate('/login');
      return;
    }
    fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await api.get('/doctor/appointments');
      if (res.data.success) {
        const unique = {};
        (res.data.appointments || []).forEach((appt) => {
          unique[appt.patient_id] = appt.patient_name || `Patient #${appt.patient_id}`;
        });
        const list = Object.entries(unique).map(([id, name]) => ({ patient_id: Number(id), patient_name: name }));
        setPatients(list);
        if (list.length && !selectedPatient) {
          setSelectedPatient(list[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (patientId) => {
    if (!patientId) return;
    try {
      const res = await api.get(`/doctor/chat/${patientId}`);
      if (res.data.success) {
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load chat', err);
    }
  };

  useEffect(() => {
    if (!selectedPatient) return;
    fetchMessages(selectedPatient.patient_id);
    const interval = setInterval(() => fetchMessages(selectedPatient.patient_id), 5000);
    return () => clearInterval(interval);
  }, [selectedPatient]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedPatient) return;
    try {
      setSending(true);
      const res = await api.post(`/doctor/chat/${selectedPatient.patient_id}`, { message: input.trim() });
      if (res.data.success) {
        setInput('');
        await fetchMessages(selectedPatient.patient_id);
      }
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const renderMessages = useMemo(() => {
    return messages.map((m) => (
      <div key={m.chat_id} className={`chat-message ${m.sender === 'Doctor' ? 'sent' : 'received'}`}>
        <div className="chat-meta">
          <span className="sender">{m.sender}</span>
          <span className="time">{new Date(m.timestamp).toLocaleString()}</span>
        </div>
        <div className="chat-bubble">{m.text}</div>
      </div>
    ));
  }, [messages]);

  if (authLoading || loading) {
    return <main className="page"><p>Loading...</p></main>;
  }

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Doctor Dashboard</p>
          <h2>Online Consultation</h2>
          <p className="muted">Chat with patients for live consultation.</p>
        </div>
        <div className="cta-row">
          <button className="ghost" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>

      <div className="dashboard-grid two-col">
        <section className="card">
          <div className="card-title">Patients</div>
          {patients.length === 0 ? (
            <p className="muted">No patients found from your appointments.</p>
          ) : (
            <ul className="list">
              {patients.map((p) => (
                <li
                  key={p.patient_id}
                  className={selectedPatient?.patient_id === p.patient_id ? 'active' : ''}
                  onClick={() => setSelectedPatient(p)}
                >
                  <strong>{p.patient_name}</strong>
                  <div className="muted">ID: {p.patient_id}</div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="card-title">Chat</div>
          {!selectedPatient ? (
            <p className="muted">Select a patient to start chatting.</p>
          ) : (
            <>
              <div className="chat-window">
                {messages.length === 0 ? <p className="muted">No messages yet.</p> : renderMessages}
              </div>
              <form className="chat-input" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <button type="submit" className="primary" disabled={sending}>Send</button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default DoctorConsultations;
