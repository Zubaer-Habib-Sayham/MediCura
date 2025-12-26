const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

const conn = db.promise();

const parseMedicineList = (value) => {
  if (!value) return [];
  try { return JSON.parse(value); } catch (err) { return []; }
};

const mapPrescriptionRow = (row) => ({
  ...row,
  medicine_list: parseMedicineList(row.medicine_list),
});

// ===== Doctor: list appointments (optionally filter by date YYYY-MM-DD) =====
router.get('/doctor/appointments', auth, async (req, res) => {
  if (req.user.role !== 'Doctor') return res.status(403).json({ success: false, message: 'Doctors only' });
  const doctorId = req.user.user_id;
  const { date } = req.query;

  try {
    const params = [doctorId];
    let whereDate = '';
    if (date) {
      whereDate = ' AND DATE(a.date_time) = ?';
      params.push(date);
    }

    const [rows] = await conn.query(
      `SELECT a.appointment_id, a.date_time, a.status,
              p.patient_id, u.username AS patient_name
       FROM Appointment a
       JOIN Patient p ON a.patient_id = p.patient_id
       JOIN User u ON p.patient_id = u.user_id
       WHERE a.doctor_id = ?${whereDate}
       ORDER BY a.date_time ASC
       LIMIT 200`,
      params
    );

    return res.json({ success: true, appointments: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load appointments', error: err });
  }
});

// ===== Doctor: list prescriptions (optionally by appointment) =====
router.get('/doctor/prescriptions', auth, async (req, res) => {
  if (req.user.role !== 'Doctor') return res.status(403).json({ success: false, message: 'Doctors only' });
  const doctorId = req.user.user_id;
  const { appointment_id } = req.query;

  try {
    const params = [doctorId];
    let filter = '';
    if (appointment_id) {
      filter = ' AND pr.appointment_id = ?';
      params.push(appointment_id);
    }

    const [rows] = await conn.query(
      `SELECT pr.prescription_id, pr.appointment_id, pr.patient_id, pr.doctor_id, pr.medicine_list, pr.date_time, pr.notes,
              u.username AS patient_name
       FROM Prescription pr
       JOIN User u ON pr.patient_id = u.user_id
       WHERE pr.doctor_id = ?${filter}
       ORDER BY pr.date_time DESC
       LIMIT 200`,
      params
    );

    return res.json({ success: true, prescriptions: rows.map(mapPrescriptionRow) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load prescriptions', error: err });
  }
});

// ===== Doctor: create prescription =====
router.post('/doctor/prescriptions', auth, async (req, res) => {
  if (req.user.role !== 'Doctor') return res.status(403).json({ success: false, message: 'Doctors only' });
  const doctorId = req.user.user_id;
  const { appointment_id, patient_id, medicine_list = [], notes } = req.body;

  if (!appointment_id || !patient_id) {
    return res.status(400).json({ success: false, message: 'appointment_id and patient_id are required' });
  }

  try {
    const [apptRows] = await conn.query(
      'SELECT appointment_id, patient_id FROM Appointment WHERE appointment_id = ? AND doctor_id = ?',
      [appointment_id, doctorId]
    );
    if (!apptRows.length) return res.status(400).json({ success: false, message: 'Appointment not found for this doctor' });
    if (apptRows[0].patient_id !== Number(patient_id)) {
      return res.status(400).json({ success: false, message: 'Patient mismatch for appointment' });
    }

    const medicineJson = JSON.stringify(medicine_list);
    const [result] = await conn.query(
      `INSERT INTO Prescription (appointment_id, patient_id, doctor_id, medicine_list, date_time, notes)
       VALUES (?,?,?,?, NOW(), ?)`,
      [appointment_id, patient_id, doctorId, medicineJson, notes || null]
    );

    const [row] = await conn.query('SELECT * FROM Prescription WHERE prescription_id = ?', [result.insertId]);
    return res.json({ success: true, prescription: mapPrescriptionRow(row[0]) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create prescription', error: err });
  }
});

// ===== Doctor: update prescription =====
router.put('/doctor/prescriptions/:id', auth, async (req, res) => {
  if (req.user.role !== 'Doctor') return res.status(403).json({ success: false, message: 'Doctors only' });
  const doctorId = req.user.user_id;
  const { id } = req.params;
  const { medicine_list, notes } = req.body;

  try {
    const [rows] = await conn.query('SELECT * FROM Prescription WHERE prescription_id = ? AND doctor_id = ?', [id, doctorId]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Prescription not found' });

    const updates = [];
    const params = [];
    if (medicine_list !== undefined) { updates.push('medicine_list = ?'); params.push(JSON.stringify(medicine_list)); }
    if (notes !== undefined) { updates.push('notes = ?'); params.push(notes); }

    if (updates.length) {
      params.push(id, doctorId);
      await conn.query(`UPDATE Prescription SET ${updates.join(', ')} WHERE prescription_id = ? AND doctor_id = ?`, params);
    }

    const [updated] = await conn.query('SELECT * FROM Prescription WHERE prescription_id = ?', [id]);
    return res.json({ success: true, prescription: mapPrescriptionRow(updated[0]) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update prescription', error: err });
  }
});

// ===== Patient: list prescriptions =====
router.get('/patient/prescriptions', auth, async (req, res) => {
  if (req.user.role !== 'Patient') return res.status(403).json({ success: false, message: 'Patients only' });
  const patientId = req.user.user_id;

  try {
    const [rows] = await conn.query(
      `SELECT pr.prescription_id, pr.appointment_id, pr.patient_id, pr.doctor_id, pr.medicine_list, pr.date_time, pr.notes,
              a.date_time AS appointment_time, u.username AS doctor_name
       FROM Prescription pr
       JOIN Appointment a ON pr.appointment_id = a.appointment_id
       JOIN User u ON pr.doctor_id = u.user_id
       WHERE pr.patient_id = ?
       ORDER BY pr.date_time DESC
       LIMIT 200`,
      [patientId]
    );

    return res.json({ success: true, prescriptions: rows.map(mapPrescriptionRow) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load prescriptions', error: err });
  }
});

// ===== Patient: view prescription details =====
router.get('/patient/prescriptions/:id', auth, async (req, res) => {
  if (req.user.role !== 'Patient') return res.status(403).json({ success: false, message: 'Patients only' });
  const patientId = req.user.user_id;
  const { id } = req.params;

  try {
    const [rows] = await conn.query(
      `SELECT pr.prescription_id, pr.appointment_id, pr.patient_id, pr.doctor_id, pr.medicine_list, pr.date_time, pr.notes,
              a.date_time AS appointment_time, u.username AS doctor_name
       FROM Prescription pr
       JOIN Appointment a ON pr.appointment_id = a.appointment_id
       JOIN User u ON pr.doctor_id = u.user_id
       WHERE pr.prescription_id = ? AND pr.patient_id = ?`,
      [id, patientId]
    );

    if (!rows.length) return res.status(404).json({ success: false, message: 'Prescription not found' });
    return res.json({ success: true, prescription: mapPrescriptionRow(rows[0]) });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load prescription', error: err });
  }
});

module.exports = router;
