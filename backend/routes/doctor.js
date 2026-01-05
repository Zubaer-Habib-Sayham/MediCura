const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();
const dbPromise = db.promise();

// Utility to parse availability fields stored as JSON or comma-separated strings
const parseJsonField = (value) => {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    // Try JSON.parse first
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
      if (typeof parsed === 'string') {
        return parsed.split(',').map((s) => s.trim()).filter(Boolean);
      }
    } catch (e) {
      // fall through to manual split
    }
    return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

// Utility to ensure we store arrays as JSON strings consistently
const stringifyMaybeArray = (value) => {
  if (value === undefined || value === null) return JSON.stringify([]);
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'string') {
    const split = value.split(',').map((s) => s.trim()).filter(Boolean);
    return JSON.stringify(split);
  }
  return JSON.stringify([value]);
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

// ===== Doctor appointments management =====
// List appointments for the logged-in doctor with optional status/date filters
router.get('/appointments', auth, async (req, res) => {
  if (req.user.role !== 'Doctor') return res.status(403).json({ success: false, message: 'Doctors only' });
  const { status, from, to } = req.query;

  try {
    const params = [req.user.user_id];
    let where = 'WHERE a.doctor_id = ?';

    if (status) {
      where += ' AND a.status = ?';
      params.push(status);
    }
    if (from) {
      where += ' AND a.date_time >= ?';
      params.push(from);
    }
    if (to) {
      where += ' AND a.date_time <= ?';
      params.push(to);
    }

    const [rows] = await dbPromise.query(
      `SELECT a.appointment_id, a.patient_id, a.doctor_id, a.date_time, a.status,
              u.username AS patient_name, u.contact_no AS patient_contact
       FROM Appointment a
       JOIN User u ON a.patient_id = u.user_id
       ${where}
       ORDER BY a.date_time ASC
       LIMIT 300`,
      params
    );

    res.json({ success: true, appointments: rows });
  } catch (err) {
    console.error('Doctor list appointments error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments', error: err.sqlMessage || err.message });
  }
});

// Update appointment status or reschedule (doctor-owned only)
router.put('/appointments/:id', auth, async (req, res) => {
  if (req.user.role !== 'Doctor') return res.status(403).json({ success: false, message: 'Doctors only' });
  const appointmentId = req.params.id;
  const { status, date_time } = req.body;

  try {
    // Ensure the appointment belongs to this doctor
    const [existing] = await dbPromise.query(
      'SELECT appointment_id, status FROM Appointment WHERE appointment_id = ? AND doctor_id = ?',
      [appointmentId, req.user.user_id]
    );
    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Appointment not found for this doctor' });
    }
    const currentStatus = existing[0].status;
    if (currentStatus === 'Completed') {
      return res.status(400).json({ success: false, message: 'Completed appointments are read-only' });
    }

    const updates = [];
    const params = [];

    if (date_time) {
      updates.push('date_time = ?');
      params.push(date_time);
      // If rescheduling without explicit status, mark as Rescheduled
      if (!status) {
        updates.push('status = ?');
        params.push('Rescheduled');
      }
    }

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (!updates.length) {
      return res.status(400).json({ success: false, message: 'No updates provided' });
    }

    params.push(appointmentId, req.user.user_id);
    await dbPromise.query(
      `UPDATE Appointment SET ${updates.join(', ')} WHERE appointment_id = ? AND doctor_id = ?`,
      params
    );

    const [updated] = await dbPromise.query(
      `SELECT a.appointment_id, a.patient_id, a.doctor_id, a.date_time, a.status,
              u.username AS patient_name, u.contact_no AS patient_contact
       FROM Appointment a
       JOIN User u ON a.patient_id = u.user_id
       WHERE a.appointment_id = ?`,
      [appointmentId]
    );

    res.json({ success: true, appointment: updated[0] });
  } catch (err) {
    console.error('Doctor update appointment error:', err);
    res.status(500).json({ success: false, message: 'Failed to update appointment', error: err.sqlMessage || err.message });
  }
});

// ===== Doctor chat consultation (with patients) =====
const parseChatMessage = (raw) => {
  if (!raw) return { text: '', sender: 'Unknown' };
  if (typeof raw === 'string') {
    try {
      const obj = JSON.parse(raw);
      if (obj && typeof obj === 'object') {
        return { text: obj.text || obj.message || '', sender: obj.sender || 'Unknown' };
      }
    } catch (e) {
      // plain text fallback
    }
    return { text: raw, sender: 'Unknown' };
  }
  return { text: String(raw), sender: 'Unknown' };
};

// Get chat messages with a specific patient
router.get('/chat/:patientId', auth, async (req, res) => {
  if (req.user.role !== 'Doctor') return res.status(403).json({ success: false, message: 'Doctors only' });
  const patientId = req.params.patientId;
  try {
    const [rows] = await dbPromise.query(
      `SELECT chat_id, patient_id, doctor_id, message, timestamp
       FROM Chat_Consultation
       WHERE doctor_id = ? AND patient_id = ?
       ORDER BY timestamp ASC
       LIMIT 300`,
      [req.user.user_id, patientId]
    );
    const messages = rows.map((r) => ({
      chat_id: r.chat_id,
      patient_id: r.patient_id,
      doctor_id: r.doctor_id,
      timestamp: r.timestamp,
      ...parseChatMessage(r.message),
    }));
    res.json({ success: true, messages });
  } catch (err) {
    console.error('Doctor chat fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to load chat', error: err.sqlMessage || err.message });
  }
});

// Send a chat message to a patient
router.post('/chat/:patientId', auth, async (req, res) => {
  if (req.user.role !== 'Doctor') return res.status(403).json({ success: false, message: 'Doctors only' });
  const patientId = req.params.patientId;
  const { message } = req.body;
  if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

  try {
    const payload = JSON.stringify({ sender: 'Doctor', text: message });
    const [result] = await dbPromise.query(
      `INSERT INTO Chat_Consultation (patient_id, doctor_id, message, timestamp)
       VALUES (?, ?, ?, NOW())`,
      [patientId, req.user.user_id, payload]
    );
    res.json({
      success: true,
      chat: {
        chat_id: result.insertId,
        patient_id: Number(patientId),
        doctor_id: req.user.user_id,
        timestamp: new Date(),
        text: message,
        sender: 'Doctor',
      },
    });
  } catch (err) {
    console.error('Doctor chat send error:', err);
    res.status(500).json({ success: false, message: 'Failed to send message', error: err.sqlMessage || err.message });
  }
});

module.exports = router;
