const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
const dbPromise = db.promise();

// Utility to parse JSON fields from DB
const parseJsonField = (value) => {
  if (!value) return [];
  try { return JSON.parse(value); } catch { return []; }
};

// Utility to stringify arrays/objects for DB
const stringifyMaybeArray = (value) => {
  if (value === undefined || value === null) return JSON.stringify([]);
  return Array.isArray(value) ? JSON.stringify(value) : JSON.stringify(value);
};

// Fetch doctor profile
async function fetchDoctorProfile(userId) {
  const [rows] = await dbPromise.query(
    `SELECT 
      u.user_id, u.username, u.email, u.gender, u.date_of_birth, u.age, u.address, u.contact_no, u.role,
      d.doctor_id, d.specialization, d.department, d.qualification, d.experience_year, d.consultation_fee,
      d.salary, d.salary_type, d.rating, d.bio, d.available_days, d.available_time_slots, d.availability_status, d.avatar
    FROM User u
    JOIN Doctor d ON u.user_id = d.doctor_id
    WHERE u.user_id = ?`,
    [userId]
  );
  if (!rows.length) return null;
  const doc = rows[0];
  return {
    ...doc,
    available_days: parseJsonField(doc.available_days),
    available_time_slots: parseJsonField(doc.available_time_slots),
  };
}

// ===== GET doctor profile =====
router.get('/me', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Doctor') return res.status(403).json({ success: false, message: 'Doctors only' });

    const doctor = await fetchDoctorProfile(req.user.user_id);
    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });

    res.json({ success: true, doctor });
  } catch (err) {
    console.error('Fetch doctor profile error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch doctor profile', error: err.sqlMessage || err.message });
  }
});

// ===== UPDATE doctor profile =====
router.put('/me', auth, async (req, res) => {
  if (req.user.role !== 'Doctor') return res.status(403).json({ success: false, message: 'Doctors only' });

  const {
    username, email, gender, date_of_birth, address, contact_no, password,
    department, specialization, qualification, experience_year,
    consultation_fee, salary, salary_type, bio, availability_status,
    available_days, available_time_slots, avatar
  } = req.body;

  const userUpdates = [];
  const userParams = [];
  const doctorUpdates = [];
  const doctorParams = [];

  try {
    // User table updates
    if (username !== undefined) { userUpdates.push('username = ?'); userParams.push(username); }
    if (email !== undefined) { 
      // Check email uniqueness
      const [existing] = await dbPromise.query('SELECT user_id FROM User WHERE email = ? AND user_id != ?', [email, req.user.user_id]);
      if (existing.length) return res.status(400).json({ success: false, message: 'Email already in use' });
      userUpdates.push('email = ?'); 
      userParams.push(email); 
    }
    if (gender !== undefined) { userUpdates.push('gender = ?'); userParams.push(gender); }
    if (date_of_birth !== undefined) { userUpdates.push('date_of_birth = ?'); userParams.push(new Date(date_of_birth).toISOString().split('T')[0]); }
    if (address !== undefined) { userUpdates.push('address = ?'); userParams.push(address); }
    if (contact_no !== undefined) { userUpdates.push('contact_no = ?'); userParams.push(contact_no); }
    if (password) { 
      const hashedPassword = await bcrypt.hash(password, 10); 
      userUpdates.push('password = ?'); 
      userParams.push(hashedPassword); 
    }

    // Doctor table updates
    if (department !== undefined) { doctorUpdates.push('department = ?'); doctorParams.push(department); }
    if (specialization !== undefined) { doctorUpdates.push('specialization = ?'); doctorParams.push(specialization); }
    if (qualification !== undefined) { doctorUpdates.push('qualification = ?'); doctorParams.push(qualification); }
    if (experience_year !== undefined) { doctorUpdates.push('experience_year = ?'); doctorParams.push(Number(experience_year) || 0); }
    if (consultation_fee !== undefined) { doctorUpdates.push('consultation_fee = ?'); doctorParams.push(Number(consultation_fee) || 0); }
    if (salary !== undefined) { doctorUpdates.push('salary = ?'); doctorParams.push(Number(salary) || 0); }
    if (salary_type !== undefined) { doctorUpdates.push('salary_type = ?'); doctorParams.push(salary_type); }
    if (bio !== undefined) { doctorUpdates.push('bio = ?'); doctorParams.push(bio); }
    if (availability_status !== undefined) { doctorUpdates.push('availability_status = ?'); doctorParams.push(availability_status); }
    if (avatar !== undefined) { doctorUpdates.push('avatar = ?'); doctorParams.push(avatar); }

    // JSON fields
    if (available_days !== undefined) {
      doctorUpdates.push('available_days = ?');
      doctorParams.push(stringifyMaybeArray(available_days));
    }
    if (available_time_slots !== undefined) {
      doctorUpdates.push('available_time_slots = ?');
      doctorParams.push(stringifyMaybeArray(available_time_slots));
    }

    // Execute updates
    if (userUpdates.length) {
      userParams.push(req.user.user_id);
      await dbPromise.query(`UPDATE User SET ${userUpdates.join(', ')} WHERE user_id = ?`, userParams);
    }
    if (doctorUpdates.length) {
      doctorParams.push(req.user.user_id);
      await dbPromise.query(`UPDATE Doctor SET ${doctorUpdates.join(', ')} WHERE doctor_id = ?`, doctorParams);
    }

    const updatedDoctor = await fetchDoctorProfile(req.user.user_id);
    res.json({ success: true, doctor: updatedDoctor });

  } catch (err) {
    console.error('Doctor update error:', err.sqlMessage || err);
    res.status(500).json({ success: false, message: 'Failed to update doctor profile', error: err.sqlMessage || err.message });
  }
});

module.exports = router;
