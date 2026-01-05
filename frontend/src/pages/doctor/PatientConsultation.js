import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PatientNav from '../../components/PatientNav';
import api from '../../api';
import { AuthContext } from '../../AuthContext';

function PatientConsultation() {
  const { doctorId } = useParams();
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingChat, setLoadingChat] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'Patient') {
      navigate('/login');
      return;
    }
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  useEffect(() => {
    if (!doctors.length) {
      setSelectedDoctor(null);
      return;
    }
    const idFromRoute = doctorId ? Number(doctorId) : null;
    const match = idFromRoute ? doctors.find((doc) => doc.doctor_id === idFromRoute) : null;
    setSelectedDoctor(match || doctors[0]);
  }, [doctors, doctorId]);

  useEffect(() => {
    if (!selectedDoctor) return;
    fetchMessages(selectedDoctor.doctor_id);
    const interval = setInterval(() => fetchMessages(selectedDoctor.doctor_id), 5000);
    return () => clearInterval(interval);
  }, [selectedDoctor]);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const res = await api.get('/patient/appointments');
      if (res.data.success) {
        const unique = {};
        (res.data.appointments || []).forEach((appt) => {
          unique[appt.doctor_id] = appt.doctor_name || `Doctor #${appt.doctor_id}`;
        });
        const list = Object.entries(unique).map(([id, name]) => ({
          doctor_id: Number(id),
          doctor_name: name,
        }));
        setDoctors(list);
      }
    } catch (err) {
      console.error('Failed to load doctors for chat', err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchMessages = async (doctorIdValue) => {
    if (!doctorIdValue) return;
    try {
      setLoadingChat(true);
      const res = await api.get(`/patient/chat/${doctorIdValue}`);
      if (res.data.success) {
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load chat', err);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedDoctor) return;
    try {
      setSending(true);
      const res = await api.post(`/patient/chat/${selectedDoctor.doctor_id}`, { message: input.trim() });
      if (res.data.success) {
        setInput('');
        await fetchMessages(selectedDoctor.doctor_id);
      }
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const renderMessages = useMemo(() => {
    return messages.map((m) => (
      <div key={m.chat_id} className={`chat-message ${m.sender === 'Patient' ? 'sent' : 'received'}`}>
        <div className="chat-meta">
          <span className="sender">{m.sender}</span>
          <span className="time">{new Date(m.timestamp).toLocaleString()}</span>
        </div>
        <div className="chat-bubble">{m.text}</div>
      </div>
    ));
  }, [messages]);

  return (
    <div className="patient-consultation">
      <PatientNav />
      <div className="page">
        <div className="page-header">
          <div>
            <p className="eyebrow">Online Consultation</p>
            <h2>Chat with your doctor</h2>
            <p className="muted">Send messages to discuss your care.</p>
          </div>
          <div className="cta-row">
            <button className="ghost" onClick={() => navigate('/patient/doctors')}>Back to doctors</button>
          </div>
        </div>

        <div className="dashboard-grid two-col">
          <section className="card">
            <div className="card-title">Doctors</div>
            {loadingDoctors ? (
              <p>Loading doctors...</p>
            ) : doctors.length === 0 ? (
              <p className="muted">No appointments found for chat yet.</p>
            ) : (
              <ul className="list">
                {doctors.map((doc) => (
                  <li
                    key={doc.doctor_id}
                    className={selectedDoctor?.doctor_id === doc.doctor_id ? 'active' : ''}
                    onClick={() => setSelectedDoctor(doc)}
                  >
                    <strong>Dr. {doc.doctor_name}</strong>
                    <div className="muted">ID: {doc.doctor_id}</div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card">
            <div className="card-title">Chat</div>
            {!selectedDoctor ? (
              <p className="muted">Select a doctor to start chatting.</p>
            ) : loadingChat ? (
              <p>Loading chat...</p>
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
      </div>
    </div>
  );
}

export default PatientConsultation;
