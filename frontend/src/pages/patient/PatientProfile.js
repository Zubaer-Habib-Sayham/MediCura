import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../AuthContext';
import PatientNav from '../../components/PatientNav';
import api from '../../api';

function PatientProfile() {
    const { user, refreshUser } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get('/patient/profile');
            if (res.data.success) {
                setProfile(res.data.profile);
                setFormData(res.data.profile);
            }
        } catch (err) {
            console.error('Failed to fetch profile:', err);
            setMessage('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const res = await api.put('/patient/profile', formData);
            if (res.data.success) {
                setProfile(res.data.profile);
                setEditing(false);
                setMessage('Profile updated successfully!');
                refreshUser(); // Refresh user data in AuthContext
            } else {
                setMessage(res.data.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Failed to update profile:', err);
            setMessage('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(profile);
        setEditing(false);
        setMessage('');
    };

    if (loading) {
        return (
            <div className="patient-profile">
                <PatientNav />
                <div className="profile-container">
                    <div className="loading">Loading profile...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="patient-profile">
            <PatientNav />

            <div className="profile-container">
                <div className="profile-header">
                    <h1>My Profile</h1>
                    {!editing && (
                        <button onClick={() => setEditing(true)} className="btn-edit">
                            Edit Profile
                        </button>
                    )}
                </div>

                {message && (
                    <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                {editing ? (
                    <form onSubmit={handleSubmit} className="profile-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email || ''}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender || ''}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input
                                    type="date"
                                    name="date_of_birth"
                                    value={formData.date_of_birth ? formData.date_of_birth.split('T')[0] : ''}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age || ''}
                                    onChange={handleChange}
                                    min="0"
                                    max="150"
                                />
                            </div>

                            <div className="form-group">
                                <label>Contact Number</label>
                                <input
                                    type="tel"
                                    name="contact_no"
                                    value={formData.contact_no || ''}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address || ''}
                                    onChange={handleChange}
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-save" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button type="button" onClick={handleCancel} className="btn-cancel">
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="profile-view">
                        <div className="profile-grid">
                            <div className="profile-field">
                                <label>Username</label>
                                <p>{profile?.username}</p>
                            </div>

                            <div className="profile-field">
                                <label>Email</label>
                                <p>{profile?.email}</p>
                            </div>

                            <div className="profile-field">
                                <label>Gender</label>
                                <p>{profile?.gender || 'Not specified'}</p>
                            </div>

                            <div className="profile-field">
                                <label>Date of Birth</label>
                                <p>{profile?.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not specified'}</p>
                            </div>

                            <div className="profile-field">
                                <label>Age</label>
                                <p>{profile?.age || 'Not specified'}</p>
                            </div>

                            <div className="profile-field">
                                <label>Contact Number</label>
                                <p>{profile?.contact_no || 'Not specified'}</p>
                            </div>

                            <div className="profile-field full-width">
                                <label>Address</label>
                                <p>{profile?.address || 'Not specified'}</p>
                            </div>

                            <div className="profile-field">
                                <label>Role</label>
                                <p>{profile?.role}</p>
                            </div>

                            <div className="profile-field">
                                <label>Patient ID</label>
                                <p>{profile?.patient_id}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PatientProfile;
