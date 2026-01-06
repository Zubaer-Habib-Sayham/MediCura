import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PatientNav from '../../components/PatientNav';
import api from '../../api';

function MedicalHistory() {
    const [medicalHistory, setMedicalHistory] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('prescriptions');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch prescriptions
            const prescRes = await api.get('/prescriptions/my');
            if (prescRes.data.success) {
                setPrescriptions(prescRes.data.prescriptions);
            }

            // Fetch medical history (if table exists)
            const historyRes = await api.get('/patient/medical-history');
            if (historyRes.data.success) {
                setMedicalHistory(historyRes.data.medical_history);
            }
        } catch (err) {
            console.error('Failed to fetch medical data:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="medical-history-page">
            <PatientNav />

            <div className="history-container">
                <h1>Medical History</h1>

                {/* Tabs */}
                <div className="tabs">
                    <button
                        className={activeTab === 'prescriptions' ? 'tab active' : 'tab'}
                        onClick={() => setActiveTab('prescriptions')}
                    >
                        Prescriptions ({prescriptions.length})
                    </button>
                    <button
                        className={activeTab === 'records' ? 'tab active' : 'tab'}
                        onClick={() => setActiveTab('records')}
                    >
                        Medical Records ({medicalHistory.length})
                    </button>
                </div>

                {loading ? (
                    <div className="loading">Loading medical history...</div>
                ) : (
                    <>
                        {/* Prescriptions Tab */}
                        {activeTab === 'prescriptions' && (
                            <div className="tab-content">
                                {prescriptions.length === 0 ? (
                                    <div className="no-data">
                                        <p>No prescriptions found.</p>
                                        <Link to="/patient/doctors" className="btn-book">
                                            Book an Appointment
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="prescriptions-list">
                                        {prescriptions.map(presc => (
                                            <div key={presc.prescription_id} className="prescription-card">
                                                <div className="prescription-header">
                                                    <h3>Prescription #{presc.prescription_id}</h3>
                                                    <span className="date">{formatDate(presc.date_time)}</span>
                                                </div>

                                                <div className="prescription-details">
                                                    <p><strong>Doctor:</strong> Dr. {presc.doctor_name}</p>
                                                    <p><strong>Appointment Date:</strong> {formatDate(presc.appointment_time)}</p>

                                                    {presc.medicine_list && presc.medicine_list.length > 0 && (
                                                        <div className="medicines">
                                                            <strong>Medicines:</strong>
                                                            <ul>
                                                                {presc.medicine_list.map((med, idx) => (
                                                                    <li key={idx}>
                                                                        {med.name || med.medicine_name || med}
                                                                        {med.dosage && ` - ${med.dosage}`}
                                                                        {med.duration && ` (${med.duration})`}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {presc.notes && (
                                                        <div className="notes">
                                                            <strong>Notes:</strong>
                                                            <p>{presc.notes}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="prescription-actions">
                                                    <button className="btn-download" onClick={() => window.print()}>
                                                        Download PDF
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Medical Records Tab */}
                        {activeTab === 'records' && (
                            <div className="tab-content">
                                {medicalHistory.length === 0 ? (
                                    <div className="no-data">
                                        <p>No medical records found.</p>
                                    </div>
                                ) : (
                                    <div className="records-list">
                                        {medicalHistory.map((record, idx) => (
                                            <div key={idx} className="record-card">
                                                <div className="record-header">
                                                    <h3>{record.title || 'Medical Record'}</h3>
                                                    <span className="date">{formatDate(record.date)}</span>
                                                </div>

                                                <div className="record-details">
                                                    {record.description && <p>{record.description}</p>}
                                                    {record.diagnosis && (
                                                        <p><strong>Diagnosis:</strong> {record.diagnosis}</p>
                                                    )}
                                                    {record.treatment && (
                                                        <p><strong>Treatment:</strong> {record.treatment}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default MedicalHistory;
