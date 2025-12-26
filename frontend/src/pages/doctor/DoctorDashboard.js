import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { AuthContext } from '../../AuthContext';

function DoctorDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [password, setPassword] = useState('');

  const initialAvailability = useMemo(() => ({
    available_days: '',
    available_time_slots: '',
  }), []);

  const [availability, setAvailability] = useState(initialAvailability);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'Doctor') {
      navigate('/login');
      return;
    }
    const fetchDoctor = async () => {
      try {
        const res = await api.get('/doctor/me');
        if (res.data.success) {
          const d = res.data.doctor;
          setDoctor(d);
          setAvailability({
            available_days: Array.isArray(d.available_days) ? d.available_days.join(', ') : (d.available_days || ''),
            available_time_slots: Array.isArray(d.available_time_slots) ? d.available_time_slots.join(', ') : (d.available_time_slots || ''),
          });
        }
      } catch (err) {
        const message = err?.response?.data?.message || err?.message || 'Failed to load doctor profile';
        alert(message);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [authLoading, navigate, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctor((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvailabilityChange = (e) => {
    const { name, value } = e.target;
    setAvailability((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctor) return;
    setSaving(true);
    try {
      const payload = {
        username: doctor.username,
        email: doctor.email,
        gender: doctor.gender,
        date_of_birth: doctor.date_of_birth,
        address: doctor.address,
        contact_no: doctor.contact_no,
        password: password || undefined,
        department: doctor.department,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experience_year: doctor.experience_year,
        consultation_fee: doctor.consultation_fee,
        salary: doctor.salary,
        salary_type: doctor.salary_type,
        bio: doctor.bio,
        availability_status: doctor.availability_status,
        available_days: availability.available_days.split(',').map((s) => s.trim()).filter(Boolean),
        available_time_slots: availability.available_time_slots.split(',').map((s) => s.trim()).filter(Boolean),
        avatar: doctor.avatar,
      };
      const res = await api.put('/doctor/me', payload);
      if (res.data.success) {
        setDoctor(res.data.doctor);
        setPassword('');
        await refreshUser();
        alert('Profile updated');
      } else {
        alert(res.data.message || 'Update failed');
      }
    } catch (err) {
        console.error('Update error:', err?.response?.data || err);
        alert('Update failed: ' + (err?.response?.data?.message || err.message));
    } finally {
        setSaving(false);
    }
  };

  if (authLoading || loading) return <main className="page"><p>Loading...</p></main>;
  if (!doctor) return <main className="page"><p>No doctor profile found.</p></main>;

  return (
    <main className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Doctor Dashboard</p>
          <h2>Profile & Availability</h2>
          <p className="muted">Keep your professional details up to date for patients and staff.</p>
        </div>
        <div className="cta-row">
          <button className="ghost" type="button" onClick={() => navigate('/doctor/prescriptions')}>Manage Prescriptions</button>
        </div>
      </div>

      <form className="dashboard-grid" onSubmit={handleSubmit}>
        <section className="card">
          <div className="card-title">Profile Picture</div>
          <div className="avatar-lg">
            {doctor.avatar ? <img src={doctor.avatar} alt="avatar" /> : <span>{doctor.username?.[0]}</span>}
          </div>
          <input name="avatar" type="url" placeholder="Avatar image URL" value={doctor.avatar || ''} onChange={handleChange} />
          <p className="muted">Paste an image URL to update your photo.</p>
        </section>

        <section className="card">
          <div className="card-title">Basic Information</div>
          <div className="form-grid">
            <input name="username" type="text" placeholder="Full Name" value={doctor.username || ''} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email" value={doctor.email || ''} onChange={handleChange} required />
            <input name="contact_no" type="text" placeholder="Phone" value={doctor.contact_no || ''} onChange={handleChange} />
            <input name="address" type="text" placeholder="Address" value={doctor.address || ''} onChange={handleChange} />
            <input name="department" type="text" placeholder="Department" value={doctor.department || ''} onChange={handleChange} />
            <input name="specialization" type="text" placeholder="Specialization" value={doctor.specialization || ''} onChange={handleChange} />
            <input name="salary" type="number" step="0.01" placeholder="Salary" value={doctor.salary || ''} onChange={handleChange} />
            <select name="salary_type" value={doctor.salary_type || 'monthly'} onChange={handleChange}>
              <option value="monthly">Monthly</option>
              <option value="per-consultation">Per Consultation</option>
            </select>
            <input name="password" type="password" placeholder="Change password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </section>

        <section className="card">
          <div className="card-title">Qualifications</div>
          <div className="form-grid">
            <input name="qualification" type="text" placeholder="Qualification" value={doctor.qualification || ''} onChange={handleChange} />
            <input name="experience_year" type="number" placeholder="Years of Experience" value={doctor.experience_year || ''} onChange={handleChange} />
            <input name="consultation_fee" type="number" step="0.01" placeholder="Consultation Fee" value={doctor.consultation_fee || ''} onChange={handleChange} />
            <textarea name="bio" rows="3" placeholder="Short bio / description" value={doctor.bio || ''} onChange={handleChange} />
          </div>
        </section>

        <section className="card">
          <div className="card-title">Availability & Consultation</div>
          <div className="form-grid">
            <input name="available_days" type="text" placeholder="Available Days (e.g. Mon, Tue)" value={availability.available_days} onChange={handleAvailabilityChange} />
            <input name="available_time_slots" type="text" placeholder="Time Slots (e.g. 10-12, 14-16)" value={availability.available_time_slots} onChange={handleAvailabilityChange} />
            <select name="availability_status" value={doctor.availability_status || 'Available'} onChange={handleChange}>
              <option value="Available">Available</option>
              <option value="Not Available">Not Available</option>
            </select>
          </div>
        </section>

        <div className="actions">
          <button type="submit" className="primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </form>
    </main>
  );
}

export default DoctorDashboard;
