import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PatientNav from '../../components/PatientNav';
import api from '../../api';

function DoctorSelection() {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [specializationFilter, setSpecializationFilter] = useState('');
    const [specializations, setSpecializations] = useState([]);

    useEffect(() => {
        fetchDoctors();
    }, []);

    useEffect(() => {
        filterDoctors();
    }, [searchTerm, specializationFilter, doctors]);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            console.log('Fetching doctors...');
            const res = await api.get('/patient/doctors');
            console.log('Doctors response:', res.data);
            if (res.data.success) {
                setDoctors(res.data.doctors);
                setFilteredDoctors(res.data.doctors);

                // Extract unique specializations
                const specs = [...new Set(res.data.doctors.map(d => d.specialization).filter(s => s))];
                setSpecializations(specs);
            } else {
                console.error('Failed:', res.data.message);
            }
        } catch (err) {
            console.error('Failed to fetch doctors:', err);
            console.error('Error response:', err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    const filterDoctors = () => {
        let filtered = doctors;

        if (searchTerm) {
            filtered = filtered.filter(doc =>
                doc.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.department?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (specializationFilter) {
            filtered = filtered.filter(doc => doc.specialization === specializationFilter);
        }

        setFilteredDoctors(filtered);
    };

    const handleBookAppointment = (doctorId) => {
        navigate(`/patient/book-appointment/${doctorId}`);
    };

    return (
        <div className="doctor-selection">
            <PatientNav />

            <div className="doctors-container">
                <div className="doctors-header">
                    <h1>Find Doctors</h1>
                    <p>Browse available doctors and book appointments</p>
                </div>

                {/* Filters */}
                <div className="filters-section">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search by name, specialization, or department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <label>Specialization:</label>
                        <select
                            value={specializationFilter}
                            onChange={(e) => setSpecializationFilter(e.target.value)}
                        >
                            <option value="">All Specializations</option>
                            {specializations.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Loading doctors...</div>
                ) : filteredDoctors.length === 0 ? (
                    <div className="no-results">
                        <p>No doctors found matching your criteria.</p>
                    </div>
                ) : (
                    <div className="doctors-grid">
                        {filteredDoctors.map(doctor => (
                            <div key={doctor.user_id} className="doctor-card">
                                <div className="doctor-avatar">
                                    {doctor.avatar ? (
                                        <img src={doctor.avatar} alt={doctor.username} />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {doctor.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>

                                <div className="doctor-info">
                                    <h3>Dr. {doctor.username}</h3>

                                    {doctor.specialization && (
                                        <p className="specialization">
                                            <strong>Specialization:</strong> {doctor.specialization}
                                        </p>
                                    )}

                                    {doctor.department && (
                                        <p className="department">
                                            <strong>Department:</strong> {doctor.department}
                                        </p>
                                    )}

                                    {doctor.qualification && (
                                        <p className="qualification">
                                            <strong>Qualification:</strong> {doctor.qualification}
                                        </p>
                                    )}

                                    {doctor.experience_year > 0 && (
                                        <p className="experience">
                                            <strong>Experience:</strong> {doctor.experience_year} years
                                        </p>
                                    )}

                                    <p className="consultation-fee">
                                        <strong>Consultation Fee:</strong> ৳{doctor.consultation_fee || 0}
                                    </p>

                                    {doctor.rating > 0 && (
                                        <p className="rating">
                                            ⭐ {doctor.rating.toFixed(1)} / 5.0
                                        </p>
                                    )}

                                    {doctor.bio && (
                                        <p className="bio">{doctor.bio}</p>
                                    )}
                                </div>

                                <div className="doctor-actions">
                                    <button
                                        onClick={() => handleBookAppointment(doctor.user_id)}
                                        className="btn-book"
                                    >
                                        Book Appointment
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DoctorSelection;
