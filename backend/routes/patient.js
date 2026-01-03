const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const axios = require('axios');

const conn = db.promise();

// SSLCommerz Configuration
const SSLCOMMERZ_CONFIG = {
  store_id: 'medic694eac346faae',
  store_passwd: 'medic694eac346faae@ssl',
  is_live: false, // Set to true for production
  session_api: 'https://sandbox.sslcommerz.com/gwprocess/v3/api.php',
  validation_api: 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php',
};

// ===== PROFILE MANAGEMENT =====

// GET patient profile
router.get('/profile', auth, async (req, res) => {
  if (req.user.role !== 'Patient') {
    return res.status(403).json({ success: false, message: 'Patients only' });
  }

  try {
    const [rows] = await conn.query(
      `SELECT u.user_id, u.username, u.email, u.gender, u.date_of_birth, u.age, u.address, u.contact_no, u.role,
              p.patient_id
       FROM User u
       JOIN Patient p ON u.user_id = p.patient_id
       WHERE u.user_id = ?`,
      [req.user.user_id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    res.json({ success: true, profile: rows[0] });
  } catch (err) {
    console.error('Fetch patient profile error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch profile', error: err.message });
  }
});

// PUT update patient profile
router.put('/profile', auth, async (req, res) => {
  if (req.user.role !== 'Patient') {
    return res.status(403).json({ success: false, message: 'Patients only' });
  }

  const { username, email, gender, date_of_birth, age, address, contact_no } = req.body;

  try {
    const updates = [];
    const params = [];

    if (username !== undefined) { updates.push('username = ?'); params.push(username); }
    if (email !== undefined) {
      // Check email uniqueness
      const [existing] = await conn.query(
        'SELECT user_id FROM User WHERE email = ? AND user_id != ?',
        [email, req.user.user_id]
      );
      if (existing.length) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      updates.push('email = ?');
      params.push(email);
    }
    if (gender !== undefined) { updates.push('gender = ?'); params.push(gender); }
    if (date_of_birth !== undefined) {
      updates.push('date_of_birth = ?');
      params.push(new Date(date_of_birth).toISOString().split('T')[0]);
    }
    if (age !== undefined) { updates.push('age = ?'); params.push(age); }
    if (address !== undefined) { updates.push('address = ?'); params.push(address); }
    if (contact_no !== undefined) { updates.push('contact_no = ?'); params.push(contact_no); }

    if (updates.length) {
      params.push(req.user.user_id);
      await conn.query(`UPDATE User SET ${updates.join(', ')} WHERE user_id = ?`, params);
    }

    // Fetch updated profile
    const [rows] = await conn.query(
      `SELECT u.user_id, u.username, u.email, u.gender, u.date_of_birth, u.age, u.address, u.contact_no, u.role,
              p.patient_id
       FROM User u
       JOIN Patient p ON u.user_id = p.patient_id
       WHERE u.user_id = ?`,
      [req.user.user_id]
    );

    res.json({ success: true, profile: rows[0] });
  } catch (err) {
    console.error('Update patient profile error:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile', error: err.message });
  }
});

// ===== DOCTORS =====

// GET list of available doctors
router.get('/doctors', auth, async (req, res) => {
  if (req.user.role !== 'Patient') {
    return res.status(403).json({ success: false, message: 'Patients only' });
  }

  const { specialization, department } = req.query;

  try {
    let query = `
      SELECT u.user_id, u.username, u.email, u.contact_no,
             d.doctor_id, d.specialization, d.department, d.qualification, 
             d.experience_year, d.consultation_fee, d.rating, d.bio, 
             d.available_days, d.available_time_slots, d.availability_status, d.avatar
      FROM User u
      JOIN Doctor d ON u.user_id = d.doctor_id
      WHERE d.availability_status = 'Available'
    `;

    const params = [];

    if (specialization) {
      query += ' AND d.specialization LIKE ?';
      params.push(`%${specialization}%`);
    }

    if (department) {
      query += ' AND d.department LIKE ?';
      params.push(`%${department}%`);
    }

    query += ' ORDER BY d.rating DESC, u.username ASC LIMIT 100';

    const [rows] = await conn.query(query, params);

    // Parse JSON fields
    const doctors = rows.map(doc => ({
      ...doc,
      available_days: doc.available_days ? JSON.parse(doc.available_days) : [],
      available_time_slots: doc.available_time_slots ? JSON.parse(doc.available_time_slots) : [],
    }));

    res.json({ success: true, doctors });
  } catch (err) {
    console.error('Fetch doctors error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch doctors', error: err.message });
  }
});

// GET doctor details by ID
router.get('/doctors/:id', auth, async (req, res) => {
  if (req.user.role !== 'Patient') {
    return res.status(403).json({ success: false, message: 'Patients only' });
  }

  try {
    const [rows] = await conn.query(
      `SELECT u.user_id, u.username, u.email, u.contact_no,
              d.doctor_id, d.specialization, d.department, d.qualification, 
              d.experience_year, d.consultation_fee, d.rating, d.bio, 
              d.available_days, d.available_time_slots, d.availability_status, d.avatar
       FROM User u
       JOIN Doctor d ON u.user_id = d.doctor_id
       WHERE u.user_id = ?`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const doctor = {
      ...rows[0],
      available_days: rows[0].available_days ? JSON.parse(rows[0].available_days) : [],
      available_time_slots: rows[0].available_time_slots ? JSON.parse(rows[0].available_time_slots) : [],
    };

    res.json({ success: true, doctor });
  } catch (err) {
    console.error('Fetch doctor error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch doctor', error: err.message });
  }
});

// ===== APPOINTMENTS =====

// GET list of appointments for logged-in patient
router.get('/appointments', auth, async (req, res) => {
  if (req.user.role !== 'Patient') {
    return res.status(403).json({ success: false, message: 'Patients only' });
  }

  const { status } = req.query;

  try {
    let query = `
      SELECT a.appointment_id, a.patient_id, a.doctor_id, a.date_time, a.status,
             u.username AS doctor_name, d.specialization, d.consultation_fee
      FROM Appointment a
      JOIN Doctor d ON a.doctor_id = d.doctor_id
      JOIN User u ON d.doctor_id = u.user_id
      WHERE a.patient_id = ?
    `;

    const params = [req.user.user_id];

    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }

    query += ' ORDER BY a.date_time DESC LIMIT 200';

    const [rows] = await conn.query(query, params);
    res.json({ success: true, appointments: rows });
  } catch (err) {
    console.error('Fetch appointments error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments', error: err.message });
  }
});

// POST create new appointment
router.post('/appointments', auth, async (req, res) => {
  if (req.user.role !== 'Patient') {
    return res.status(403).json({ success: false, message: 'Patients only' });
  }

  const { doctor_id, date_time } = req.body;

  if (!doctor_id || !date_time) {
    return res.status(400).json({ success: false, message: 'doctor_id and date_time are required' });
  }

  try {
    // Verify doctor exists and is available
    const [doctorRows] = await conn.query(
      'SELECT doctor_id, availability_status FROM Doctor WHERE doctor_id = ?',
      [doctor_id]
    );

    if (!doctorRows.length) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    if (doctorRows[0].availability_status !== 'Available') {
      return res.status(400).json({ success: false, message: 'Doctor is not available' });
    }

    // Create appointment with 'Pending' status (will be confirmed after payment)
    const [result] = await conn.query(
      `INSERT INTO Appointment (patient_id, doctor_id, date_time, status)
       VALUES (?, ?, ?, 'Pending')`,
      [req.user.user_id, doctor_id, date_time]
    );

    const [appointment] = await conn.query(
      `SELECT a.appointment_id, a.patient_id, a.doctor_id, a.date_time, a.status,
              u.username AS doctor_name, d.specialization, d.consultation_fee
       FROM Appointment a
       JOIN Doctor d ON a.doctor_id = d.doctor_id
       JOIN User u ON d.doctor_id = u.user_id
       WHERE a.appointment_id = ?`,
      [result.insertId]
    );

    res.json({ success: true, appointment: appointment[0] });
  } catch (err) {
    console.error('Create appointment error:', err);
    res.status(500).json({ success: false, message: 'Failed to create appointment', error: err.message });
  }
});

// PUT update appointment (reschedule)
router.put('/appointments/:id', auth, async (req, res) => {
  if (req.user.role !== 'Patient') {
    return res.status(403).json({ success: false, message: 'Patients only' });
  }

  const { date_time, status } = req.body;

  try {
    // Verify appointment belongs to patient
    const [existing] = await conn.query(
      'SELECT appointment_id FROM Appointment WHERE appointment_id = ? AND patient_id = ?',
      [req.params.id, req.user.user_id]
    );

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const updates = [];
    const params = [];

    if (date_time !== undefined) { updates.push('date_time = ?'); params.push(date_time); }
    if (status !== undefined) { updates.push('status = ?'); params.push(status); }

    if (updates.length) {
      params.push(req.params.id);
      await conn.query(`UPDATE Appointment SET ${updates.join(', ')} WHERE appointment_id = ?`, params);
    }

    const [appointment] = await conn.query(
      `SELECT a.appointment_id, a.patient_id, a.doctor_id, a.date_time, a.status,
              u.username AS doctor_name, d.specialization, d.consultation_fee
       FROM Appointment a
       JOIN Doctor d ON a.doctor_id = d.doctor_id
       JOIN User u ON d.doctor_id = u.user_id
       WHERE a.appointment_id = ?`,
      [req.params.id]
    );

    res.json({ success: true, appointment: appointment[0] });
  } catch (err) {
    console.error('Update appointment error:', err);
    res.status(500).json({ success: false, message: 'Failed to update appointment', error: err.message });
  }
});

// DELETE cancel appointment
router.delete('/appointments/:id', auth, async (req, res) => {
  if (req.user.role !== 'Patient') {
    return res.status(403).json({ success: false, message: 'Patients only' });
  }

  try {
    // Verify appointment belongs to patient
    const [existing] = await conn.query(
      'SELECT appointment_id, status FROM Appointment WHERE appointment_id = ? AND patient_id = ?',
      [req.params.id, req.user.user_id]
    );

    if (!existing.length) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Update status to 'Cancelled' instead of deleting
    await conn.query(
      'UPDATE Appointment SET status = ? WHERE appointment_id = ?',
      ['Cancelled', req.params.id]
    );

    res.json({ success: true, message: 'Appointment cancelled successfully' });
  } catch (err) {
    console.error('Cancel appointment error:', err);
    res.status(500).json({ success: false, message: 'Failed to cancel appointment', error: err.message });
  }
});

// ===== PAYMENTS =====

// GET payment history
router.get('/payments', auth, async (req, res) => {
  if (req.user.role !== 'Patient') {
    return res.status(403).json({ success: false, message: 'Patients only' });
  }

  try {
    // Check if Payment table exists, if not return empty array
    const [rows] = await conn.query(
      `SELECT p.*, a.date_time AS appointment_date, u.username AS doctor_name
       FROM Payment p
       LEFT JOIN Appointment a ON p.appointment_id = a.appointment_id
       LEFT JOIN Doctor d ON a.doctor_id = d.doctor_id
       LEFT JOIN User u ON d.doctor_id = u.user_id
       WHERE p.patient_id = ?
       ORDER BY p.payment_date DESC
       LIMIT 100`,
      [req.user.user_id]
    ).catch(() => [[]]);

    res.json({ success: true, payments: rows });
  } catch (err) {
    console.error('Fetch payments error:', err);
    res.json({ success: true, payments: [] }); // Return empty if table doesn't exist
  }
});

// POST initiate payment for appointment
router.post('/payments/initiate', auth, async (req, res) => {
  if (req.user.role !== 'Patient') {
    return res.status(403).json({ success: false, message: 'Patients only' });
  }

  const { appointment_id } = req.body;

  if (!appointment_id) {
    return res.status(400).json({ success: false, message: 'appointment_id is required' });
  }

  try {
    // Get appointment details
    const [appointments] = await conn.query(
      `SELECT a.appointment_id, a.patient_id, a.doctor_id, a.date_time, a.status,
              d.consultation_fee, u.username AS patient_name, u.email AS patient_email, u.contact_no
       FROM Appointment a
       JOIN Doctor d ON a.doctor_id = d.doctor_id
       JOIN User u ON a.patient_id = u.user_id
       WHERE a.appointment_id = ? AND a.patient_id = ?`,
      [appointment_id, req.user.user_id]
    );

    if (!appointments.length) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const appointment = appointments[0];
    const amount = appointment.consultation_fee || 500; // Default fee if not set

    // Generate unique transaction ID
    const tran_id = `MEDIC${Date.now()}${appointment_id}`;

    // SSLCommerz payment data
    const paymentData = {
      store_id: SSLCOMMERZ_CONFIG.store_id,
      store_passwd: SSLCOMMERZ_CONFIG.store_passwd,
      total_amount: amount,
      currency: 'BDT',
      tran_id: tran_id,
      success_url: `http://localhost:5000/api/patient/payments/success`,
      fail_url: `http://localhost:5000/api/patient/payments/fail`,
      cancel_url: `http://localhost:5000/api/patient/payments/cancel`,
      ipn_url: `http://localhost:5000/api/patient/payments/ipn`,
      product_name: 'Doctor Consultation',
      product_category: 'Medical',
      product_profile: 'general',
      cus_name: appointment.patient_name,
      cus_email: appointment.patient_email || 'patient@medicura.com',
      cus_add1: 'Dhaka',
      cus_city: 'Dhaka',
      cus_country: 'Bangladesh',
      cus_phone: appointment.contact_no || '01700000000',
      shipping_method: 'NO',
      num_of_item: 1,
      value_a: appointment_id, // Store appointment_id for later
      value_b: req.user.user_id, // Store patient_id for later
    };

    // Call SSLCommerz API
    const response = await axios.post(SSLCOMMERZ_CONFIG.session_api, paymentData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (response.data.status === 'SUCCESS') {
      // Store pending payment in database (if Payment table exists)
      try {
        await conn.query(
          `INSERT INTO Payment (patient_id, appointment_id, amount, payment_method, transaction_id, status, payment_date)
           VALUES (?, ?, ?, 'SSLCommerz', ?, 'Pending', NOW())`,
          [req.user.user_id, appointment_id, amount, tran_id]
        );
      } catch (dbErr) {
        console.log('Payment table might not exist, skipping insert:', dbErr.message);
      }

      res.json({
        success: true,
        gatewayUrl: response.data.GatewayPageURL,
        transaction_id: tran_id
      });
    } else {
      res.status(400).json({ success: false, message: 'Payment initiation failed', error: response.data });
    }
  } catch (err) {
    console.error('Payment initiation error:', err);
    res.status(500).json({ success: false, message: 'Failed to initiate payment', error: err.message });
  }
});

// POST payment success callback
router.post('/payments/success', async (req, res) => {
  const { tran_id, val_id, amount, value_a, value_b } = req.body;
  const appointment_id = value_a;
  const patient_id = value_b;

  try {
    // Validate payment with SSLCommerz
    const validationUrl = `${SSLCOMMERZ_CONFIG.validation_api}?val_id=${val_id}&store_id=${SSLCOMMERZ_CONFIG.store_id}&store_passwd=${SSLCOMMERZ_CONFIG.store_passwd}&format=json`;
    const validation = await axios.get(validationUrl);

    if (validation.data.status === 'VALID' || validation.data.status === 'VALIDATED') {
      // Update payment status
      try {
        await conn.query(
          `UPDATE Payment SET status = 'Completed', validation_id = ? WHERE transaction_id = ?`,
          [val_id, tran_id]
        );
      } catch (dbErr) {
        console.log('Payment table update failed:', dbErr.message);
      }

      // Update appointment status to 'Confirmed'
      await conn.query(
        'UPDATE Appointment SET status = ? WHERE appointment_id = ?',
        ['Confirmed', appointment_id]
      );

      // Redirect to frontend success page
      res.redirect(`http://localhost:3000/patient/payment-success?appointment_id=${appointment_id}`);
    } else {
      res.redirect(`http://localhost:3000/patient/payment-failed`);
    }
  } catch (err) {
    console.error('Payment success callback error:', err);
    res.redirect(`http://localhost:3000/patient/payment-failed`);
  }
});

// POST payment fail callback
router.post('/payments/fail', async (req, res) => {
  const { tran_id } = req.body;

  try {
    await conn.query(
      `UPDATE Payment SET status = 'Failed' WHERE transaction_id = ?`,
      [tran_id]
    ).catch(() => {});
  } catch (err) {
    console.error('Payment fail callback error:', err);
  }

  res.redirect(`http://localhost:3000/patient/payment-failed`);
});

// POST payment cancel callback
router.post('/payments/cancel', async (req, res) => {
  const { tran_id } = req.body;

  try {
    await conn.query(
      `UPDATE Payment SET status = 'Cancelled' WHERE transaction_id = ?`,
      [tran_id]
    ).catch(() => {});
  } catch (err) {
    console.error('Payment cancel callback error:', err);
  }

  res.redirect(`http://localhost:3000/patient/payment-cancelled`);
});

// ===== MEDICAL HISTORY =====

// GET medical history
router.get('/medical-history', auth, async (req, res) => {
  if (req.user.role !== 'Patient') {
    return res.status(403).json({ success: false, message: 'Patients only' });
  }

  try {
    // Try to fetch from Medical_History table if it exists
    const [rows] = await conn.query(
      `SELECT * FROM Medical_History WHERE patient_id = ? ORDER BY date DESC LIMIT 100`,
      [req.user.user_id]
    ).catch(() => [[]]);

    res.json({ success: true, medical_history: rows });
  } catch (err) {
    console.error('Fetch medical history error:', err);
    res.json({ success: true, medical_history: [] }); // Return empty if table doesn't exist
  }
});

module.exports = router;
